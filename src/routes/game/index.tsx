
import { Component, h } from "preact";
import { useRef } from "preact/hooks";

interface Props {
  gameId: string;
}
interface State {

}

export default class Game extends Component<Props,State> {
  constructor () {
    super();
  }
  render () {
    const canvasRef = useRef();
    return <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  }

}
