
import { BoxGeometry, Camera, Color, DirectionalLight, InstancedMesh, Light, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial, Object3D, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
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

function fixScene (scene: Scene, camera: Camera) {
  let materialNames = new Map<string, Material>();
  const white = new Color("white");
  const black = new Color("black");

  scene.traverse((child) => {
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
  });
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

export default class Room extends Component<Props, State> {

  _ref?: HTMLDivElement;
  scene?: Scene;
  camera?: Camera;
  renderer?: WebGLRenderer;
  hasInit?: boolean;

  constructor() {
    super();

    window.onresize = () => {
      const r = this._ref.getBoundingClientRect();

      this.renderer.setSize(r.width, r.height);
      (this.camera as PerspectiveCamera).aspect = r.width / r.height;
      (this.camera as PerspectiveCamera).updateProjectionMatrix();
    }
  }
  componentDidMount(): void {
    const r = this._ref.getBoundingClientRect();

    if (!this.hasInit) {
      this.hasInit = true;

      this.scene = new Scene();

      const aspect = r.width / r.height;

      // this.camera = new OrthographicCamera(
      //   -aspect, aspect, -1, 1, 0.1, 100 
      // );
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
        getRandomRoomId().then((roomId)=>{
          this.props.roomId = roomId;
          loadRoom(this.props.roomId, this.scene).then((room)=>{
            fixScene(this.scene, this.camera);
            spawnCharacters(room.expand.occupants, this.scene);
          });
        });
      } else {
        console.log("Found roomId prop, loading from database");
        loadRoom(this.props.roomId, this.scene).then((room)=>{
          fixScene(this.scene, this.camera);
          spawnCharacters(room.expand.occupants, this.scene);
        });
      }

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

  render() {
    return <div className={style.room} ref={(_ref) => {
      this._ref = _ref;
    }}>
    </div>
  }
}
