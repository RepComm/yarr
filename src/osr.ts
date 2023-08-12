import { Camera, Object3D, Scene, WebGLRenderer } from "three";

interface RenderInfo {
  scene: Object3D;
  width: number;
  height: number;
  camera: Camera;
}

export const osr = {
  renderer: null as WebGLRenderer,

  init () {
    osr.renderer = new WebGLRenderer({
      alpha: false,
      antialias: true,
      preserveDrawingBuffer: true
    });
  },

  render (info: RenderInfo) {
    osr.renderer.setSize(info.width, info.height);
    osr.renderer.render(info.scene, info.camera);
    return osr.renderer.domElement.toDataURL();
  }
}

osr.init();
