
import Pocketbase, { RecordFullListQueryParams, RecordQueryParams } from "pocketbase/dist/pocketbase.es.mjs";

export type DbRowId = string;
export interface DbRow<T = unknown> {
  id: DbRowId;
  created: string;
  updated: string;
  expand?: T;
}

export interface AssetJson extends DbRow {
  file: string;
  label: string;
}

export interface InstancedModelExpands {
  asset: AssetJson;
}

export interface InstancedModelPlacement {
  x: number;
  y: number;
  z: number;
  sx?: number;
  sy?: number;
  sz?: number;
  qx?: number;
  qy?: number;
  qz?: number;
  qw?: number;
}

export interface InstancedModel extends DbRow {
  asset: DbRowId;
  placements: Array<InstancedModelPlacement>;
  expand?: Partial<InstancedModelExpands>;
}
export interface UserJson extends DbRow {

}
interface CharacterExpand {
  owner: UserJson;
  inventory: ItemJson[];
  equipped: ItemJson[];
}
export interface CharacterJson extends DbRow {
  x: number;
  y: number;
  z: number;
  name: string;
  owner: DbRowId;
  inventory: DbRowId[];
  equipped: DbRowId[];
  expand: CharacterExpand;
}

export interface RoomExpands {
  model_placements: Array<InstancedModel>;
  occupants: Array<CharacterJson>;
}

export interface DbRoom extends Partial<DbRow> {
  model_placements: DbRowId[];
  occupants: DbRowId[];
  label: string;
  description: string;
  expand?: Partial<RoomExpands>;
}

export interface ItemDefExpands extends Partial<DbRow> {
  asset: AssetJson;
}
export interface ItemDefJson extends Partial<DbRow> {
  wearable_bone_name: string;
  asset: DbRowId;
  wearable: boolean;
  label: string;
  description: string;
  expand: ItemDefExpands;
}

export interface ItemExpands {
  definition: ItemDefJson;
  owner: CharacterJson;
}
export interface ItemJson extends Partial<DbRow> {
  definition: DbRowId;
  owner: DbRowId;
  count: number;
  description: string;
  expand: ItemExpands;
}

export const db = {
  selectedCharacter: null as CharacterJson,
  ctx: null as Pocketbase,
  init () {
    const dbPort = 8090;
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:${dbPort}`;
    db.ctx = new Pocketbase(baseUrl);
  },

  register (username: string, password: string, passwordConfirm: string) {
    return db.ctx.collection("users").create({
      username,
      password,
      passwordConfirm,
      name: username
    });
  },

  login (uname: string, upass: string) {
    return db.ctx.collection("users").authWithPassword(uname, upass);
  },

  logout () {
    return db.ctx.authStore.clear();
  },

  isLoggedIn () {
    return db.ctx && db.ctx.authStore.isValid;
  },

  fetchAsset (assetId: string, queryParams?: RecordQueryParams) {
    return db.ctx.collection("assets").getOne<AssetJson>(assetId, queryParams);
  },
  fetchAssetByLabel(label: string) {
    return db.ctx.collection("assets").getFirstListItem<AssetJson>(`label="${label}"`);
  },
  fetchRoom (roomId: string, queryParams?: RecordQueryParams) {
    return db.ctx.collection("rooms").getOne<DbRoom>(roomId, queryParams);
  },
  listRooms (queryParams?: RecordFullListQueryParams) {
    return db.ctx.collection("rooms").getFullList(queryParams);
  },
  listCharacters (filter: string, max: number = 10) {
    return db.ctx.collection("characters").getList<CharacterJson>(0, max, {
      filter
    });
  },
  selectCharacter (ch: CharacterJson) {
    db.selectedCharacter = ch;
  },
  equipItems (characterId: DbRowId, ...itemIds: DbRowId[]) {
    db.ctx.collection("characters").update(characterId, {
      "equipped+": itemIds
    });
  },
  unequipItems (characterId: DbRowId, ...itemIds: DbRowId[]) {
    db.ctx.collection("characters").update(characterId, {
      "equipped-": itemIds
    });
  },
  /**Create an instance of an item, using its item definition id
   * and giving it to the character as an owner, as well as into its inventory
  */
  addItem (characterId: DbRowId, itemDefId: DbRowId, itemDescription: string = "") {
    db.ctx.collection("item").create<ItemJson>({
      count: 1,
      definition: itemDefId,
      description: itemDescription,
      owner: characterId
    } as ItemJson).then((item)=>{
      db.ctx.collection("characters").update(characterId, {
        "inventory+": item.id
      });
    });
  }
};
