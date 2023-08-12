import { Object3D } from "three";

export function findObjectByName (parent: Object3D, name: string) {
  let result: Object3D;

  parent.traverse((child)=>{
    if (result) return;
    if (child.name === name) {
      result = child;
    }
  });
  return result;
}

export function has<T>(a: Array<T>, min: number = 1) {
  return a.length >= min;
}
