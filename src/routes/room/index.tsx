
import { BoxGeometry, Camera, DirectionalLight, InstancedMesh, Light, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial, Object3D, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Component, h } from "preact";
import style from "./style.css";
import { db } from "../../db";

interface Props {
  roomId: string;
}
interface State {
}

const loader = new GLTFLoader();

async function loadRoom(roomId: string, scene: Scene) {
  const room = await db.fetchRoom(roomId, {
    expand: "instanced_models,instanced_models.asset"
  });


  for (let instm of room.expand.instanced_models) {
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
      return;
    }

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

      // this.camera.position.z = 5;

      this.renderer = new WebGLRenderer({
        alpha: false,
        antialias: false
      });

      loadRoom("hm38smaprly1g9g", this.scene).then(() => {
        let materialNames = new Map<string, Material>();

        this.scene.traverse((child) => {
          if (child.name === "cameraMountPoint") {
            // child.add(this.camera);
            child.getWorldPosition(this.camera.position);
            child.getWorldQuaternion(this.camera.quaternion);
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
                      map: mat.map
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
      });

      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new Mesh(geometry, material);
      this.scene.add(cube);

      // this._ref.appendChild(this.renderer.domElement);

      const render = () => {
        requestAnimationFrame(render);

        cube.rotateZ(0.1);

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
