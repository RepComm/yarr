
import { Component, h } from "preact";
import { MutableRef, useRef } from "preact/hooks";
import { AnimationMixer, Camera, Color, DirectionalLight, Intersection, Material, Mesh, MeshStandardMaterial, MeshToonMaterial, Object3D, PerspectiveCamera, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Character } from "../../character";
import Three, { InitSceneCb, RenderSceneCb } from "../../components/three";
import { DbCharacter, DbRoom, db } from "../../db";
import { findObjectByName } from "../../utils";

import style from "./style.css";

interface Props {
  roomId: string;
}
interface State {
}

const loader = new GLTFLoader();

async function loadRoom(roomId: string, scene: Scene) {
  const room = await db.fetchRoom(roomId, {
    expand: "model_placements,model_placements.asset,occupants"
  });

  const mixers = new Array<AnimationMixer>();

  if (room && room.expand && room.expand.model_placements) {
    for (let instm of room.expand.model_placements) {
      if (!instm.placements || !Array.isArray(instm.placements) || instm.placements.length < 1) {
        console.error("Room", room.id, "instanced_models", instm.id, "placements invalid, expected [{\"x\":0,\"y\":0,\"z\":0}] like, but got", instm.placements);
        continue;
      }
      const url = db.ctx.files.getUrl(
        instm.expand.asset as any,
        instm.expand.asset.file)

      const gltf = await loader.loadAsync(url);

      if (instm.placements.length === 1) {
        const placement = instm.placements[0];

        scene.add(gltf.scene);
        gltf.scene.position.set(
          placement.x,
          placement.y,
          placement.z
        );

        const mixer = new AnimationMixer(gltf.scene);
        mixers.push(mixer);
        for (const clip of gltf.animations) {
          mixer.clipAction(clip).play();
        }
      } else {
        for (let i = 0; i < instm.placements.length; i++) {
          const placement = instm.placements[i];

          const cloned = gltf.scene.clone(true);
          cloned.position.set(
            placement.x,
            placement.y,
            placement.z
          );
          scene.add(cloned);

          const mixer = new AnimationMixer(cloned);
          for (const clip of gltf.animations) {
            mixer.clipAction(clip, cloned).play();
          }
          mixers.push(mixer);
        }
      }
    }
  }

  return [room, mixers];
}

interface ChildFixConfig {
  camera: Camera;
  materialNames: Map<string, Material>;
  white: Color;
  black: Color;
}

function fixChild(child: Object3D, cfg: ChildFixConfig) {
  const {
    camera, materialNames, white, black
  } = cfg;
  if (child.name === "cameraMountPoint") {
    // child.add(this.camera);
    child.getWorldPosition(camera.position);
    child.getWorldQuaternion(camera.quaternion);
  }
  if (child.userData) {
    if (child.userData.invis === "true") {
      child.visible = false;
    }
    let mesh = child as Mesh;
    if (mesh.isMesh) {
      let mat = mesh.material as MeshStandardMaterial;

      if (mat.userData) {

        if (mat.userData.toon !== "false") {
          let nextMaterial = materialNames.get(mat.name);
          if (!nextMaterial) {
            nextMaterial = new MeshToonMaterial({
              color: mat.color,
              name: mat.name,
              visible: mat.visible,
              map: mat.map,
              transparent: mat.userData.transparent === "true" ? true : false,
              emissive: mat.userData.emissive ? white : black,
              emissiveIntensity: mat.userData.emissive || 1
            });
            materialNames.set(nextMaterial.name, nextMaterial);
          }
          mesh.material = nextMaterial;
        }
      }
    }

    let lgt: DirectionalLight = child as any;

    if (lgt.isLight) {
      // if (lgt.isDirectionalLight) {
      lgt.intensity /= 2000;
      // }
    }
  }
}

async function getRandomRoomId() {
  let rooms = await db.listRooms();
  const index = Math.floor(Math.random() * rooms.length);
  console.log(index, rooms.length);
  return rooms[index].id;
}

let LocalCharacterResolved = false;
let TryResolveLocalCharacter: (c: Character) => void;
export const LocalCharacter = new Promise((resolve, reject) => {
  TryResolveLocalCharacter = (v) => {
    if (!LocalCharacterResolved) {
      LocalCharacterResolved = true;
      resolve(v);
    }
  }
});

function spawnCharacters(occupants: DbCharacter[], scene: Scene) {
  if (!occupants || occupants.length < 1) return;

  for (const occupant of occupants) {
    const updatedDate = (new Date(occupant.updated)).getTime();
    const now = Date.now();
    const diff = now - updatedDate;
    const secondDiff = diff / 1000;

    const minuteDiff = secondDiff / 60;

    let isLocal = false;
    if (occupant.id === db.selectedCharacterId) isLocal = true;

    // console.log(minuteDiff);

    //ignore 30 minute old data
    //TODO - handle updated character spawning
    if (minuteDiff > 30 && !isLocal) continue;

    console.log("Spawning", occupant.name);

    // if (occupant.updated)
    Character.spawn(occupant, scene).then((ch) => {
      ch.scene.position.set(
        occupant.x, occupant.y, occupant.z
      );
      const local = findObjectByName(ch.scene, "local");
      if (!db.selectedCharacterId || occupant.id !== db.selectedCharacterId) {
        local.visible = false;
      } else {
        TryResolveLocalCharacter(ch);
      }
    })

  }
}

/**Update character.room, under the hood relies on pb_hooks/yarr.pb.js to update room.occupants*/
export async function characterJoinRoom(toId: string, charId: string) {
  return db.ctx.collection("characters").update<DbCharacter>(charId, {
    room: toId
  } as Partial<DbCharacter>)
}

export async function tryNavRoom(name: string) {
  let room: DbRoom = undefined;
  try {
    room = await db.ctx.collection("rooms").getFirstListItem<DbRoom>(`label="${name}"`);
  } catch (ex) {
    console.warn("Couldn't nav to room", name, "couldn't find valid db entry");
    return;
  }
  // await characterJoinRoom(room.id, db.selectedCharacterId);

  // setTimeout(()=>{
  window.location.href = `/play/${room.id}`;
  // }, 10);
}

function arrayDiff<T>(prev: T[], next: T[]) {
  const removed = prev.filter(item => !next.includes(item));
  const added = next.filter(item => !prev.includes(item));

  return {
    removed,
    added
  };
}

export default class Room extends Component<Props, State> {
  onInitScene: InitSceneCb;
  onRenderScene: RenderSceneCb;

  scene: Scene;
  camera: Camera;
  r: MutableRef<Three>;
  mixers: Array<AnimationMixer>;

  constructor() {
    super();

    this.mixers = [];

    this.onInitScene = () => {
      const scene = this.scene = new Scene();
      const camera = this.camera = new PerspectiveCamera();

      let roomIdResolve = !this.props.roomId ? getRandomRoomId() : Promise.resolve(this.props.roomId);
      roomIdResolve.then(async (roomId) => {
        // console.log(roomId);
        db.selectedRoomId = roomId;
        this.props.roomId = roomId;

        await characterJoinRoom(roomId, db.selectedCharacterId);

        this.setupRoom();
      });

      return {
        camera,
        scene
      };
    };

  }

  setupRoom() {
    loadRoom(this.props.roomId, this.scene).then((res) => {
      const room = res[0] as DbRoom;
      this.mixers = res[1] as Array<AnimationMixer>;

      //listen to room updates
      db.ctx.collection("rooms")
        .subscribe<DbRoom>(room.id, async (data) => {
          if (data.action !== "update") return;
          const update = data.record;

          // console.log("Updated room", room.id, room.occupants, update.occupants);

          const { removed, added } = arrayDiff(room.occupants, update.occupants);
          if (removed.length > 0) {
            for (const who of removed) {
              if (Character.remove(who)) {
                console.log("Player", who, "removed from room");
              } else {
                console.warn("Failed to remove player who left the room", who);
              }
            }
          }
          if (added.length > 0) {
            const promises = new Array<Promise<DbCharacter>>();
            for (const who of added) {
              console.log("Player", who, "added to room");

              promises.push(db.ctx.collection("characters").getOne(who));
            }
            spawnCharacters(await Promise.all(promises), this.scene);
          }

          room.occupants = update.occupants;
        });

      const cfg = {
        materialNames: new Map<string, Material>(),
        white: new Color("white"),
        black: new Color("black"),
        camera: this.camera
      };

      const gotoRoom = new Array<Mesh>();

      const groundClickable = new Array<Mesh>();

      const hoverAnim = new Array<Mesh>();

      const minigame = new Array<Mesh>();

      this.scene.traverse((child) => {
        fixChild(child, cfg);
        let m = child as Mesh;
        if (m.isMesh && m.userData) {
          if (m.userData["goto-room"]) {
            gotoRoom.push(m);
          }
          if (m.userData["ground-clickable"] || m.name === "ground-clickable") {
            groundClickable.push(m);
          }
          // console.log(m.userData);
          if (m.userData["hover-anim"]) {
            hoverAnim.push(m);
          }
          if (m.userData["minigame"]) {
            minigame.push(m);
          }
        }
      });

      this.r.current.listenToClick({
        cb: (inters) => {
          const first = inters[0].object;
          const roomName = first.userData["goto-room"];

          console.log("Go To Room", roomName);

          tryNavRoom(roomName);
        },
        objects: gotoRoom,
        recursive: true
      });

      this.r.current.listenToClick({
        cb: (inters) => {
          const first = inters[0].object;
          const inter = inters[0];
          const point = inter.point;
          const { x, y, z, } = point;

          const id = db.selectedCharacterId;

          const ch = Character.all.get(id);
          let rx = 0;
          let ry = 0;
          let rz = 0;

          if (ch) {
            ch.scene.lookAt(point);
            
            rx = ch.scene.rotation.x;
            ry = ch.scene.rotation.y;
            rz = ch.scene.rotation.z;
          }
          db.ctx.collection("characters").update(id, {
            x,
            y,
            z,
            rx,
            ry,
            rz
          } as Partial<DbCharacter>);
        },
        objects: groundClickable,
        recursive: true
      });

      this.r.current.listenToClick({
        cb: (inters) => {
          const first = inters[0].object;
          console.log("Hover anim", first.userData["hover-anim"]);
        },
        objects: hoverAnim,
        recursive: true
      });

      this.r.current.listenToClick({
        cb: (inters) => {
          const first = inters[0].object;
          console.log("Open minigame", first.userData["minigame"]);
        },
        objects: minigame,
        recursive: true
      });

      spawnCharacters(room.expand.occupants, this.scene);
    });
  }

  render() {
    this.r = useRef<Three>();

    const result = <Three
      ref={this.r}
      style={{
        minWidth: "100%",
        minHeight: "100%"
      }}
      onInitScene={this.onInitScene}
      onRenderScene={(delta)=>{
        for (const mixer of this.mixers) {
          mixer.update(delta);
        }
      }}
    />

    return <div className={style.container}>
      {result}
      <div className={style.chatbar}>
        <div className={style.chaticon} />
        <div className={style.chaticon} />
        <div className={style.chaticon} />
        <div className={style.chaticon} />

        <input className={style.chatbox}
          onChange={(evt)=>{
            const s = evt.target as HTMLInputElement;
            const chat = s.value.trim();
            // console.log(chat);
            if (chat === "") {
              console.log("Empty chat messages do not transmit");
              return;
            }
            const chat_sent_time = new Date().toISOString();
            
            s.value = "";
            
            db.ctx.collection("characters").update<DbCharacter>(
              db.selectedCharacterId, {
                chat,
                chat_sent_time
              }
            );
          }}
        />

        <div className={style.chaticon} />
        <div className={style.chaticon} />
        <div className={style.chaticon} />
        <div className={style.chaticon} />
      </div>
    </div>
  }
}
