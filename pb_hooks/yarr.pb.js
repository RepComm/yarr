
/// <reference path="../pb_data/types.d.ts" />

onAfterBootstrap((e)=>{
  console.log("Hello Yarr Pocketbase instance");
});

//Update room occupants based on player.room
onModelBeforeUpdate((e)=>{
  function array_remove (arr, item) {
    const idx = arr.indexOf(item);
    if (idx !== -1) {
      arr.splice(idx, 1);
      return true;
    }
    return false;
  }

  // console.log("Player update event");
  /**@type {models.Model}*/
  const original = e.model.originalCopy();
  const prev_room_id = original.get("room");
  let prev_room_name = "";
  const next_room_id = e.model.get("room");
  let next_room_name = "";

  const pid = e.model.getId();
  const pname = e.model.get("name");

  try {
    const prev_room = $app.dao().findRecordById("rooms", prev_room_id);
    if (prev_room) {
      prev_room_name = prev_room.get("label");
      let occs = prev_room.get("occupants");
      if (array_remove(occs, pid)) {
        prev_room.set("occupants", occs);
        $app.dao().saveRecord(prev_room);
      }
    }
  } catch (ex) {

  }

  try {
    const next_room = $app.dao().findRecordById("rooms", next_room_id);
    if (next_room) {
      next_room_name = next_room.get("label");
      next_room.set("occupants", [...next_room.get("occupants"), pid]);
      $app.dao().saveRecord(next_room);
    }
  } catch (ex) {

  }

  console.log("Player " + pname + " leaves " + prev_room_name + " and joins " + next_room_name);

}, "characters");
