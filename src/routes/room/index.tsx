
import { PerspectiveCamera, BoxGeometry, Camera, Mesh, MeshBasicMaterial, OrthographicCamera, Scene, WebGLRenderer } from "three";

import { Component, h } from "preact";
import style from "./style.css";

interface Props {

}
interface State {
}

export default class Room extends Component<Props, State> {
  
  _ref?: HTMLDivElement;
  scene?: Scene;
  camera?: Camera;
  renderer?: WebGLRenderer;
  hasInit?: boolean;

  constructor () {
    super();
  }
  componentDidMount(): void {
    const r = this._ref.getBoundingClientRect();

    if (!this.hasInit) {
      this.hasInit = true;

      this.scene = new Scene();

      const aspect = r.width / r.height;

      this.camera = new OrthographicCamera(
        -aspect, aspect, -1, 1, 0.1, 100 
      );
      
      this.camera.position.z = 5;

      this.renderer = new WebGLRenderer({
        alpha: false,
        antialias: false
      });

      const geometry = new BoxGeometry( 1, 1, 1 );
      const material = new MeshBasicMaterial( { color: 0x00ff00 } );
      const cube = new Mesh( geometry, material );
      this.scene.add( cube );
      
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
  
  render () {
    
    return <div className={style.room} ref={(_ref)=>{
      this._ref = _ref;
    }}>
    </div>
  }
}
