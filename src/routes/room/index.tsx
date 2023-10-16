
import { BoxGeometry, Camera, Color, DirectionalLight, InstancedMesh, Intersection, Light, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial, Object3D, OrthographicCamera, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderer } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Component, h } from "preact";
import style from "./style.css";
import { CharacterJson, db } from "../../db";
import { Character } from "../../character";
import Profile from "../../components/profile";
import { findObjectByName } from "../../utils";

interface Props {
  roomId: string;
}
interface State {
}

const loader = new GLTFLoader();

async function loadRoom(roomId: string, scene: Scene) {
  const room = await db.fetchRoom(roomId, {
    expand: "model_placements,model_placements.asset,occupants"
  });

  for (let instm of room.expand.model_placements) {
    if (!instm.placements || !Array.isArray(instm.placements) || instm.placements.length < 1) {
      console.error("Room", room.id, "instanced_models", instm.id, "placements invalid, expected [{\"x\":0,\"y\":0,\"z\":0}] like, but got", instm.placements);
      continue;
    }
    const url = db.ctx.files.getUrl(
      instm.expand.asset as any,
      instm.expand.asset.file)

    const gltf = await loader.loadAsync(url);


    if (instm.placements.length === 1) {
      const placement = instm.placements[0];

      scene.add(gltf.scene);
      gltf.scene.position.set(
        placement.x,
        placement.y,
        placement.z
      );
    } else {
      for (let i = 0; i < instm.placements.length; i++) {
        const placement = instm.placements[i];
  
        const cloned = gltf.scene.clone(true);
        cloned.position.set(
          placement.x,
          placement.y,
          placement.z
        );
        scene.add(cloned);
      }
    }
  }
  return room;
}

interface ChildFixConfig {
  camera: Camera;
  materialNames: Map<string, Material>;
  white: Color;
  black: Color;
}

function fixChild ( child: Object3D, cfg: ChildFixConfig) {
  const {
    camera, materialNames, white, black
  } = cfg;
  if (child.name === "cameraMountPoint") {
    // child.add(this.camera);
    child.getWorldPosition(camera.position);
    child.getWorldQuaternion(camera.quaternion);
  }
  if (child.userData) {
    if (child.userData.invis === "true") {
      child.visible = false;
    }
    let mesh = child as Mesh;
    if (mesh.isMesh) {
      let mat = mesh.material as MeshStandardMaterial;

      if (mat.userData) {

        if (mat.userData.toon !== "false") {
          let nextMaterial = materialNames.get(mat.name);
          if (!nextMaterial) {
            nextMaterial = new MeshToonMaterial({
              color: mat.color,
              name: mat.name,
              visible: mat.visible,
              map: mat.map,
              transparent: mat.userData.transparent==="true" ? true : false,
              emissive: mat.userData.emissive ? white : black,
              emissiveIntensity: mat.userData.emissive || 1
            });
            materialNames.set(nextMaterial.name, nextMaterial);
          }
          mesh.material = nextMaterial;
        }
      }
    }

    let lgt: DirectionalLight = child as any;
    
    if (lgt.isLight) {
      // if (lgt.isDirectionalLight) {
        lgt.intensity /= 2000;
      // }
    }
  }
}

async function getRandomRoomId () {
  let rooms = await db.listRooms();
  const index = Math.floor( Math.random() * rooms.length );
  console.log(index, rooms.length);
  return rooms[index].id;
}

let LocalCharacterResolved = false;
let TryResolveLocalCharacter: (c: Character)=>void;
export const LocalCharacter = new Promise((resolve,reject)=>{
  TryResolveLocalCharacter = (v)=>{
    if (!LocalCharacterResolved) {
      LocalCharacterResolved = true;
      resolve(v);
    }
  }
});

function spawnCharacters (occupants: CharacterJson[], scene: Scene) {
  if (!occupants || occupants.length < 1) return;

  for (const occupant of occupants) {
    console.log("Spawning", occupant.name);
    Character.spawn(occupant, scene).then((ch)=>{
      ch.scene.position.set(
        occupant.x, occupant.y, occupant.z
      );
      const local = findObjectByName(ch.scene, "local");
      if (!db.selectedCharacter || occupant.id !== db.selectedCharacter.id) {
        local.visible = false;
      } else {
        TryResolveLocalCharacter(ch);
      }
    })

  }
}

export interface Clickables {
  objects: Array<Object3D>;
  cb: (inters: Intersection[])=> void;
  recursive?: boolean;
}

export default class Room extends Component<Props, State> {

  _ref?: HTMLDivElement;
  scene?: Scene;
  camera?: Camera;
  renderer?: WebGLRenderer;
  hasInit?: boolean;

  caster: Raycaster;
  pointer: Vector2;
  onClick: (evt: MouseEvent)=> void;
  clickables: Set<Clickables>;

  listenToClick (c: Clickables) {
    this.clickables.add(c);
  }
  deafenToClick (c: Clickables) {
    this.clickables.delete(c);
  }

  constructor() {
    super();

    window.onresize = () => {
      const r = this._ref.getBoundingClientRect();

      this.renderer.setSize(r.width, r.height);
      (this.camera as PerspectiveCamera).aspect = r.width / r.height;
      (this.camera as PerspectiveCamera).updateProjectionMatrix();
    }
    
    this.clickables = new Set();
    this.caster = new Raycaster();
    this.pointer = new Vector2();

    this.onClick = (evt)=>{
      let cx = evt.offsetX;
      let cy = evt.offsetY;
      let w = this.renderer.domElement.width;
      let h = this.renderer.domElement.height;
      
      this.pointer.set(
        (cx / w) * 2 -1,
        - ((cy / h) * 2 -1)
      );

      this.caster.setFromCamera(this.pointer, this.camera);

      for (const c of this.clickables) {
        const result = this.caster.intersectObjects(
          c.objects,
          c.recursive
          );
        if (result.length > 0) c.cb(result);
      }
    }
  }
  componentWillUnmount(): void {
    window.removeEventListener("click", this.onClick);
  }
  componentWillMount(): void {
    window.addEventListener("click", this.onClick);
  }
  async componentDidMount() {
    const r = this._ref.getBoundingClientRect();

    if (!this.hasInit) {
      this.hasInit = true;

      this.scene = new Scene();

      const aspect = r.width / r.height;

      this.camera = new PerspectiveCamera();
      (this.camera as PerspectiveCamera).aspect = aspect;
      (this.camera as PerspectiveCamera).updateProjectionMatrix();

      this.renderer = new WebGLRenderer({
        alpha: false,
        antialias: true
      });
      this.renderer.setClearColor("#ffffff");

      if (!this.props.roomId) {
        console.log("No roomId prop, randomly getting roomId from database");
        this.props.roomId = await getRandomRoomId();
      } else {
        console.log("Found roomId prop, loading from database");
      }
      this.setupRoom();

      // const geometry = new BoxGeometry(1, 1, 1);
      // const material = new MeshToonMaterial({color: "#556677"});
      // const cube = new Mesh(geometry, material);
      // cube.position.y = 1;
      // this.scene.add(cube);

      const render = () => {
        requestAnimationFrame(render);

        // cube.rotateY(0.1);

        this.renderer.render(this.scene, this.camera);
      };
      requestAnimationFrame(render);
    }

    this._ref.appendChild(this.renderer.domElement);
    this.renderer.setSize(r.width, r.height);
  }

  setupRoom () {
    loadRoom(this.props.roomId, this.scene).then((room)=>{
      const cfg = {
        materialNames: new Map<string, Material>(),
        white: new Color("white"),
        black: new Color("black"),
        camera: this.camera
      };
      
      const gotoRoom = new Array<Mesh>();

      this.scene.traverse((child) => {
        fixChild(child, cfg);
        let m = child as Mesh;
        if (m.isMesh && m.userData) {
          if (m.userData["goto-room"]) {
            gotoRoom.push(m);
          }
        }
      });

      this.listenToClick({
        cb: (inters)=>{
          const first = inters[0].object;
          console.log("Go To Room", first.userData["goto-room"]);
          console.log(inters);
        },
        objects: gotoRoom,
        recursive: true
      });

      spawnCharacters(room.expand.occupants, this.scene);

      this.scene
    });
  }

  render() {
    return <div className={style.room} ref={(_ref) => {
      this._ref = _ref;
    }}>
    </div>
  }
}
