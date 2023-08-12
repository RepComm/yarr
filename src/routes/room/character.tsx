
import { Group, Mesh, Object3D, Scene, Vector3 } from "three";
import { CharacterJson, db } from "../../db";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { helvetiker } from "../../assets/fonts/helvetiker_regular.typeface";

const loader = new GLTFLoader();
const fontLoader = new FontLoader();

export class Character {
  static gltf: GLTF;
  static font: Font;
  
  static async ensureAssetLoaded () {
    if (Character.gltf) return;

    const asset = await db.fetchAssetByLabel("character");
    const url = db.ctx.files.getUrl(
      asset as any,
      asset.file
    );

    Character.gltf = await loader.loadAsync(url);
    
    Character.font = fontLoader.parse(helvetiker);
  }

  static all: Map<string, Character>;

  static spawn (json: CharacterJson, scene: Scene) {
    const result = new Character();
    result.scene = Character.gltf.scene.clone(true);

    result.nameGeometry = new TextGeometry(json.name, {
      font: Character.font,
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
      -width/2,
      1.2,
      0
    );
    result.scene.add(result.nameMesh);

    // findObjectByName(result.scene, "body").rotateY(90);

    scene.add(result.scene);
    Character.all.set(json.id, result);
    return result;
  }

  scene: Group;
  nameGeometry: TextGeometry;
  nameMesh: Mesh;

  private constructor () {
  }
}
Character.all = new Map();
