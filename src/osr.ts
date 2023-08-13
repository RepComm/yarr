import { Camera, Object3D, Scene, WebGLRenderer } from "three";
import { Queue } from "./queue";

interface RenderInfo {
  scene: Object3D;
  width: number;
  height: number;
  camera: Camera;
}
export type RenderResult = Promise<string>;
export interface RenderJob {
  promise: RenderResult;
  info: RenderInfo;
  resolve: (result: string)=> void;
}

export const osr = {
  renderer: null as WebGLRenderer,
  queue: null as Queue<RenderJob>,

  init () {
    osr.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    
    osr.queue = new Queue();

    const frame = async ()=> {
      await osr.process();
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  },

  render (info: RenderInfo): RenderResult {
    const promise = new Promise<string>(async (resolve, reject)=>{
      osr.queue.enqueue({
        info,
        promise,
        resolve
      });
    });

    return promise;
  },
  process () {
    return new Promise<void>(async (resolve, reject)=>{
      const job = osr.queue.dequeue();
      if (!job) {
        resolve();
        return;
      }
      const info = job.info;
  
      osr.renderer.setClearColor("#ffffff", 0);
      osr.renderer.setSize(info.width, info.height);
      osr.renderer.render(info.scene, info.camera);
      
      job.resolve(osr.renderer.domElement.toDataURL());
      resolve();
    });
  }
}

osr.init();
