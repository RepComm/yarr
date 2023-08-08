
import Pocketbase from "pocketbase/dist/pocketbase.es.mjs";

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
  }
};
