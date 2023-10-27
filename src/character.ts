
import { Color, Euler, Group, Mesh, MeshStandardMaterial, Object3D, Scene, Vector3 } from "three";
import { DbCharacter, db } from "./db";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { helvetiker } from "./assets/fonts/helvetiker_regular.typeface";
import { Item } from "./item";
import { findObjectByName } from "./utils";
import { UnsubscribeFunc } from "pocketbase";

const loader = new GLTFLoader();
const fontLoader = new FontLoader();

export const CharAssetProvider = db.fetchAssetByLabel("character");

export const CharModelUrlProvider = new Promise<string>(async (resolve, reject) => {
  const asset = await CharAssetProvider;
  resolve(db.ctx.files.getUrl(
    asset as any,
    asset.file
  ));
});

export const CharModelProvider = new Promise<GLTF>(async (resolve, reject) => {
  const url = await CharModelUrlProvider;
  loader.loadAsync(url).then(resolve).catch(reject);
});

export const FontProvider = new Promise<Font>((resolve, reject) => {
  try {
    resolve(fontLoader.parse(helvetiker));
  } catch (ex) {
    reject(ex);
  }
});

export class Character {

  static all: Map<string, Character>;

  static async spawn(json: DbCharacter, scene: Scene) {
    const result = new Character(json);

    const gltf = await CharModelProvider;
    result.scene = gltf.scene.clone(true);

    const font = await FontProvider;

    result.nameGeometry = new TextGeometry(json.name, {
      font,
      size: 0.15,
      height: 0.01
    });

    let width = 0;
    {
      const temp = new Vector3();
      result.nameGeometry.computeBoundingBox();
      result.nameGeometry.boundingBox.getSize(temp);
      width = Math.max(temp.x, temp.y, temp.z);
    }

    result.nameMesh = new Mesh(result.nameGeometry);
    result.nameMesh.position.set(
      -width / 2,
      1.2,
      0
    );
    result.scene.add(result.nameMesh);

    // findObjectByName(result.scene, "body").rotateY(90);

    result.scene.traverse((child) => {
      let m = child as Mesh;
      if (m.isMesh) {
        let mat = m.material as MeshStandardMaterial;
        const ud = mat.userData;
        let colorable = ud["colorable"];
        if (colorable === true || colorable === "true") {
          if (json.color) {
            mat = mat.clone();
            mat.color = new Color(json.color);
            m.material = mat;
            console.log("Assigned color to character", json.color);
          }
        }
      }
    });


    scene.add(result.scene);
    Character.all.set(json.id, result);

    result.init();

    return result;
  }

  scene: Group;
  nameGeometry: TextGeometry;
  nameMesh: Mesh;

  equipped: Map<string, Item>;

  definition: DbCharacter;

  renderEquipped() {
    for (let itemId of this.definition.equipped) {
      Item.get(itemId).then((item) => {
        this.equipped.set(itemId, item);
        if (item.definition.wearable) {
          const bonename = item.definition.wearable_bone_name;
          const bone = findObjectByName(this.scene, bonename);
          if (bone) {
            bone.add(item.scene);
          } else {
            console.warn("No bone found for wearable_bone_name", bonename);
          }
        }
      })
    }
  }

  private constructor(definition: DbCharacter) {
    this.definition = definition;
    this.equipped = new Map();

    this.target = new Vector3(
      definition.x || 0,
      definition.y || 0,
      definition.z || 0
    );
    this.dist = 0;
    this.walkSpeed = 3;

    if (!this.scene) {
      CharModelProvider.then((gltf) => {
        this.scene = gltf.scene.clone(true);
        this.renderEquipped();
      });
    } else {
      this.renderEquipped();
    }
  }

  target: Vector3;

  get rotation(): Euler {
    return this.scene.rotation;
  }

  get actual(): Vector3 {
    return this.scene.position;
  }

  dist: number;
  walkSpeed: number;

  setTarget(x: number, y: number, z: number, rx?: number, ry?: number, rz?: number, teleport: boolean = false) {
    this.target.set(x, y, z);
    if (rx !== undefined && ry !== undefined && rz !== undefined) {
      this.scene.rotation.set(rx, ry, rz);
    }

    if (teleport) {
      this.actual.copy(this.target);
      return;
    }

    // this.anim.play("waddle");

    this.dist = this.target.distanceTo(this.actual);

    // if (this.stopWaddleAnimTimeout) {
    //   clearTimeout(this.stopWaddleAnimTimeout);
    //   this.stopWaddleAnimTimeout = null;
    // }

    // this.stopWaddleAnimTimeout = setTimeout(()=>{
    //   this.anim.stop("waddle");
    // }, 1000 * this.dist/this.walkSpeed);
  }

  updateInterval: any;

  unsubPromise: Promise<UnsubscribeFunc>;

  init() {
    this.unsubPromise = db.ctx.collection("characters")
      .subscribe<DbCharacter>(
        this.definition.id,
        (evt) => {
          if (evt.action !== "update") return;
          const update = evt.record;

          this.setTarget(
            update.x,
            update.y,
            update.z,
            update.rx,
            update.ry,
            update.rz,
            false
          );

          //now calculated by the client and sent to db
          // this.scene.lookAt(pos);

        });

    const fps = 30;
    const interval = 1000 / fps;

    this.updateInterval = setInterval(() => {
      this.update(interval / 1000, Date.now());
    }, interval);
  }

  deinit() {
    //stop subscription
    this.unsubPromise.then((unsub)=>{
      unsub();
    });

    //stop animation
    clearInterval(this.updateInterval);
    
    //remove model from scene
    this.scene.removeFromParent();
  }

  update(delta: number, absTime: number) {
    this.dist = this.actual.distanceTo(this.target);
    if (this.dist > 0.1) {
      this.actual.lerp(this.target, (delta * 1 / this.dist) * this.walkSpeed);
    }

    // this.anim.mixer.setTime(absTime/1000);
  }

  static remove (id: string): boolean {
    const which = Character.all.get(id);
    Character.all.delete(id);
    if (!which) return false;

    which.deinit();
    return true;
  }
}
Character.all = new Map();
