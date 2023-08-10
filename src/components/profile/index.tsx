import { Component, h } from "preact";
import style from "./style.css";

interface Props {

}
interface State {
  
}

export default class Profile extends Component<Props,State> {
  constructor () {
    super();
  }
  render () {
    return <div
      className={style.profile}>
      <div className={style.row}>
        <div className={style.name}>Player</div>
        <div className={style.exit}>x</div>
      </div>
      <div className={style.container} />
    </div>
  }
}
