
import Pocketbase, { RecordFullListQueryParams, RecordQueryParams } from "pocketbase/dist/pocketbase.es.mjs";

export type DbRowId = string;
export interface DbRow<T = unknown> {
  id: DbRowId;
  created: string;
  updated: string;
  expand?: T;
}

export interface Asset extends DbRow {
  file: string;
  label: string;
}

export interface InstancedModelExpands {
  asset: Asset;
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
export interface CharacterJson extends DbRow {
  x: number;
  y: number;
  z: number;
  name: string;
  owner: DbRowId;
  inventory: DbRowId[];
  equipped: DbRowId[];
}

export interface RoomExpands {
  model_placements: Array<InstancedModel>;
  occupants: Array<CharacterJson>;
}

export interface Room extends Partial<DbRow> {
  model_placements: DbRowId[];
  occupants: DbRowId[];
  label: string;
  description: string;
  expand?: Partial<RoomExpands>;
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
    return db.ctx.collection("assets").getOne<Asset>(assetId, queryParams);
  },
  fetchAssetByLabel(label: string) {
    return db.ctx.collection("assets").getFirstListItem<Asset>(`label="${label}"`);
  },
  fetchRoom (roomId: string, queryParams?: RecordQueryParams) {
    return db.ctx.collection("rooms").getOne<Room>(roomId, queryParams);
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
  }
};
