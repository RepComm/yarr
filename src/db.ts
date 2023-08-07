
import Pocketbase from "pocketbase/dist/pocketbase.es.mjs";

export const db = {
  ctx: null as Pocketbase,
  init () {
    const baseUrl = "http://localhost:8080"
    db.ctx = new Pocketbase(baseUrl);
  },

  login (uname: string, upass: string) {
    return db.ctx.collection("users").authWithPassword(uname, upass);
  },

  logout () {
    return db.ctx.authStore.clear();
  }
};
