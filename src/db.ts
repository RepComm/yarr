
import Pocketbase, { RecordQueryParams } from "pocketbase/dist/pocketbase.es.mjs";

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
export interface Character {
  x: number;
  y: number;
  z: number;
  name: string;
  owner: DbRowId;
  inventory: DbRowId[];
  equipped: DbRowId[];
}

export interface RoomExpands {
  instanced_models: Array<InstancedModel>;
  occupants: Array<Character>;
}

export interface Room extends Partial<DbRow> {
  instanced_models: DbRowId[];
  occupants: DbRowId[];
  label: string;
  description: string;
  expand?: Partial<RoomExpands>;
}

export const db = {
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

  fetchRoom (roomId: string, queryParams?: RecordQueryParams) {
    return db.ctx.collection("rooms").getOne<Room>(roomId, queryParams);
  }
};
