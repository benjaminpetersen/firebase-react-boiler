// This file is just experimental for learning - should use more reacty solutions. Existing ws hook, or rxjs
import {
  decodeDocUpdate,
  uint8ToDocUpdateEvent,
} from "@chewing-bytes/firebase-standards";
import * as Y from "yjs";
import { loadFile, saveChanges } from "../network/storage";
type RoomSubscription = (msg: string) => void;

const docCache = new Map<string, Y.Doc>();
const cache = new Map<string, RoomSubscription[]>();

const setArr = <T>(arr: T[], newArr: T[]) => {
  arr.splice(0, arr.length, ...newArr);
};

const getSubs = (roomName: string) => {
  const subs = cache.get(roomName) || [];
  cache.set(roomName, subs);
  return subs;
};

const _setupNewDoc = async (roomName: string) => {
  const persistedData = await loadFile(roomName).catch((e) => {
    console.error("E", e);
    return undefined;
  });
  const doc = new Y.Doc();
  if (persistedData) Y.applyUpdate(doc, persistedData);
  return doc;
};

// TODO stampede - store docCache as Promise<>
export const getDoc = async (roomName: string) => {
  const doc = docCache.get(roomName) || (await _setupNewDoc(roomName));
  docCache.set(roomName, doc);
  return doc;
};

export const subscribeToRoom = (roomName: string, sub: RoomSubscription) => {
  const subs = getSubs(roomName);
  subs.push(sub);
  return () => {
    const newSubscribers = subs.filter((cb) => cb !== sub);
    setArr(subs, newSubscribers);
    if (newSubscribers.length === 0) {
      docCache.delete(roomName);
      cache.delete(roomName);
    }
  };
};

export const emitToRooms = async (
  roomName: string,
  data: string,
  skipSubscriber?: RoomSubscription,
) => {
  const subs = getSubs(roomName);
  const doc = await getDoc(roomName);
  const update = decodeDocUpdate(data);
  const d = update.type === "doc-connect" ? update.fullDoc : update.data;
  Y.applyUpdate(doc, new Uint8Array(d));
  saveChanges(doc, roomName).catch((err) => {
    console.log("Failing persistence", err);
  });
  const state = Y.encodeStateVector(doc);
  const encodeUpdate = uint8ToDocUpdateEvent(roomName);
  for (const sub of subs) {
    if (sub !== skipSubscriber) {
      sub(JSON.stringify(encodeUpdate(new Uint8Array(d), state)));
    }
  }
};
