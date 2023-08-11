
import { Component, h } from "preact";
import style from "./style.css";

interface Props {

}
interface State {

}

export default class Loading extends Component<Props,State> {
  constructor () {
    super();
  }
  render () {
    return <div className={style.loading}></div>
  }
}
