import { Component, h } from "preact";
import style from "./style.css";
import { CharacterJson } from "../../db";
import { osr } from "../../osr";
import { CharModelProvider, Character } from "../../routes/room/character";
import { AmbientLight, Camera, PerspectiveCamera, Scene } from "three";
import { findObjectByName, has } from "../../utils";

interface OnProfileSelect {
  (character: CharacterJson): void;
}

interface Props {
  character: CharacterJson;
  onSelect?: OnProfileSelect;
  isDialog?: boolean;
  isSelected?: boolean;
}
interface State {
  render?: string;
}

export default class Profile extends Component<Props, State> {
  needsCharacterRender: boolean;
  camera: Camera;
  ambient: AmbientLight;
  scene: Scene;

  constructor() {
    super();
    this.needsCharacterRender = true;
  }
  async renderCharacter () {
    this.needsCharacterRender = false;

    if (!this.scene) this.scene = new Scene();

    const gltf = await CharModelProvider;
    this.scene.add(gltf.scene);

    const width = 256;
    const height = 256;
    const aspect = width / height;

    //make sure we have a camera
    if (!this.camera) this.camera = has(gltf.cameras) ?
      gltf.cameras[0] :
      new PerspectiveCamera(30, aspect, 0.1, 50);
    
    let hadToCreateCamera = true;
    if (!this.camera) {
      if ( has(gltf.cameras) ) {
        hadToCreateCamera = false;
        this.camera = gltf.cameras[0];
      } else {
        this.camera = new PerspectiveCamera(30, aspect, 0.1, 50);
        this.scene.add(this.camera);
      }
    }

    if (hadToCreateCamera) {
      //try to adjust the camera as intended by 3d modeller
      const mount = findObjectByName(gltf.scene, "CameraMount");
      if (mount) {
        mount.getWorldPosition(this.camera.position);
        mount.getWorldQuaternion(this.camera.quaternion);
      }
    }

    let camera = this.camera as PerspectiveCamera;
    if (camera.isPerspectiveCamera) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }

    //make sure we have some light
    if (!this.ambient) {
      this.ambient = new AmbientLight("#ffffff", 1);
      this.scene.add(this.ambient);
    }
    
    console.log("render");
    const result = osr.render({
      width: 256,
      height: 256,
      camera: this.camera,
      scene: this.scene
    });
    
    gltf.scene.remove();

    this.setState({
      render: result
    });

  }
  componentWillMount(): void {
    if (this.needsCharacterRender) {
      this.renderCharacter();
    }
  }
  render() {
    return <div
      onClick={() => {
        if (this.props.onSelect) {
          this.props.onSelect(this.props.character);
        }
      }}
      className={`${style.profile} ${this.props.isSelected ? style.selected : ""}`}>
      <div className={style.row}>
        <div className={style.name}>{this.props.character.name}</div>
        {this.props.isDialog &&
          <div className={style.exit}>x</div>
        }
      </div>
      <div className={style.container} style={{backgroundImage: this.state.render ? `url(${this.state.render})` : ""}} />
    </div>
  }
}
