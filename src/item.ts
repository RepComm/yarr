
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AssetJson, ItemDefJson, ItemJson, db } from "./db";
import { Object3D } from "three";

const loader = new GLTFLoader();

export class Item {
  static assetIdModelMap: Map<string, Promise<GLTF>>;

  static getModel (asset: AssetJson): Promise<GLTF> {
    let result = Item.assetIdModelMap.get(asset.id);

    if (!result) {
      result = new Promise(async (resolve, reject)=>{
        const url = db.ctx.files.getUrl(
          asset as any,
          asset.file
        );
  
        const gltf = await loader.loadAsync(url);
        resolve(gltf);

      });
      this.assetIdModelMap.set(asset.id, result);
    }
    return result;
  }

  static all: Map<string, Promise<Item>>;

  static allDefs: Map<string, ItemDefJson>;

  static get (itemId: string): Promise<Item> {
    let result = Item.all.get(itemId);
    
    if (result) return result;

    const promise = new Promise<Item>(async (resolve, reject)=>{
      const itemJson = await db.ctx.collection("items").getOne<ItemJson>(
        itemId,
        { expand: "definition,definition.asset" }
      );
      
      let def = itemJson.expand.definition;
      let existingDef = Item.allDefs.get(def.id);

      if (existingDef) {
        def = existingDef;
      }
      
      const asset = def.expand.asset;

      const gltf = await Item.getModel(asset);

      const result = new Item(def);
      // result.gltf = gltf;
      result.scene = gltf.scene.clone(true);

      resolve(result);
    });
    Item.all.set(itemId, promise);
    return promise;
  }

  definition: ItemDefJson;

  private constructor (def: ItemDefJson) {
    this.definition = def;
  }
  // gltf: GLTF;
  scene: Object3D;
}
Item.all = new Map();
Item.assetIdModelMap = new Map();
Item.allDefs = new Map();
