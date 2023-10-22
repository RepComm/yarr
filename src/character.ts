
import { Color, Group, Mesh, MeshStandardMaterial, Object3D, Scene, Vector3 } from "three";
import { DbCharacter, db } from "./db";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { helvetiker } from "./assets/fonts/helvetiker_regular.typeface";
import { Item } from "./item";
import { findObjectByName } from "./utils";

const loader = new GLTFLoader();
const fontLoader = new FontLoader();

export const CharAssetProvider = db.fetchAssetByLabel("character");

export const CharModelUrlProvider = new Promise<string>(async (resolve, reject)=>{
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

export const FontProvider = new Promise<Font>((resolve, reject)=>{
  try {
    resolve(fontLoader.parse(helvetiker));
  } catch(ex) {
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
    
    result.scene.traverse((child)=>{
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
    return result;
  }

  scene: Group;
  nameGeometry: TextGeometry;
  nameMesh: Mesh;

  equipped: Map<string, Item>;

  definition: DbCharacter;

  renderEquipped () {
    for (let itemId of this.definition.equipped) {
      Item.get(itemId).then((item)=>{  
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

    if (!this.scene) {
      CharModelProvider.then((gltf)=>{
        this.scene = gltf.scene.clone(true);
        this.renderEquipped();
      });
    } else {
      this.renderEquipped();
    }
  }
}
Character.all = new Map();
