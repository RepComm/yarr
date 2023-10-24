import { Component, h } from "preact";
import { Camera, Raycaster, Scene, Vector2, WebGLRenderer } from "three";
import type { Intersection, Object3D, OrthographicCamera, PerspectiveCamera, WebGLRendererParameters } from "three";

export interface InitSceneConfig {
  scene: Scene;
  camera: Camera;
}
export interface InitSceneCb {
  (): InitSceneConfig;
}

export interface Clickables {
  objects: Array<Object3D>;
  cb: (inters: Intersection[])=> void;
  recursive?: boolean;
}

export interface ThreeProps {
  onInitScene: InitSceneCb;
  webglParams?: WebGLRendererParameters;
  clearColor?: string;
  style?: any;
}
export interface ThreeState {
  
}
export default class Three extends Component<ThreeProps, ThreeState> {

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

      const aspect = r.width / r.height;

      this.fixCamera(aspect);
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
  fixCamera (aspect: number) {
    let pc = this.camera as PerspectiveCamera;
    if (pc.isPerspectiveCamera) {
      pc.aspect = aspect;
      pc.updateProjectionMatrix();
    }
    let oc = this.camera as OrthographicCamera;
    if (oc.isOrthographicCamera) {
      //TODO - handle ortho size here
      oc.updateProjectionMatrix();
    }
  }
  async componentDidMount() {
    const r = this._ref.getBoundingClientRect();

    if (!this.hasInit) {
      this.hasInit = true;

      
      const {scene, camera} = this.props.onInitScene();
      this.scene = scene;
      this.camera = camera;

      const aspect = r.width / r.height;

      this.fixCamera(aspect);

      const params = this.props.webglParams ||{
        alpha: false,
        antialias: true
      };

      this.renderer = new WebGLRenderer(params);

      const clearColor = this.props.clearColor||"#ffffff";
      this.renderer.setClearColor(clearColor);

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
    return <div
      style={this.props.style}
      ref={(_ref) => {
        this._ref = _ref;
      }
    } />
  }
}
