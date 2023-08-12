import { Component, h } from "preact";
import style from "./style.css";
import { CharacterJson } from "../../db";
import { osr } from "../../osr";
import { Character } from "../../routes/room/character";
import { AmbientLight, PerspectiveCamera } from "three";
import { findObjectByName } from "../../utils";

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
  camera: PerspectiveCamera;
  ambient: AmbientLight;

  constructor() {
    super();
    this.needsCharacterRender = true;
  }
  renderCharacter () {
    let ch = Character.all.get(this.props.character.id);
    if (ch && ch.scene) {
      console.log("Character found, trying to render it", ch.scene);

      this.needsCharacterRender = false;

      const width = 256;
      const height = 256;
      const aspect = width / height;

      if (!this.camera) {
        this.camera = new PerspectiveCamera(30, aspect, 0.1, 50);
      }
      if (!this.ambient) {
        this.ambient = new AmbientLight("#ffffff", 1);
      }
      const mount = findObjectByName(ch.scene, "CameraMount");
      if (mount) {
        mount.getWorldPosition(this.camera.position);
        mount.getWorldQuaternion(this.camera.quaternion);
      }

      // this.camera.lookAt(ch.scene.position);
      
      ch.scene.add(this.camera);
      ch.scene.add(this.ambient);

      console.log("render");
      const result = osr.render({
        width: 256,
        height: 256,
        camera: this.camera,
        scene: ch.scene
      });
      this.camera.remove();
      this.ambient.remove();

      this.setState({
        render: result
      })

    } else {
      console.log("Trying again later");
      //try again a little later
      // setTimeout(()=>{
      //   if (this.needsCharacterRender) {
      //     this.renderCharacter();
      //   }
      // }, 250);

    }
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
