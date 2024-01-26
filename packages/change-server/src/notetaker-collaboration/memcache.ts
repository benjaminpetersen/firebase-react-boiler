// This file is just experimental for learning - should use more reacty solutions. Existing ws hook, or rxjs
import {
  strToDocUpdate,
  uint8ToDocUpdateEvent,
} from "@chewing-bytes/firebase-standards";
import * as Y from "yjs";
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

const getDoc = (roomName: string) => {
  const doc = docCache.get(roomName) || new Y.Doc();
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

export const emitToRooms = (
  roomName: string,
  data: string,
  skipSubscriber?: RoomSubscription,
) => {
  const subs = getSubs(roomName);
  const doc = getDoc(roomName);
  const update = strToDocUpdate(data);
  Y.applyUpdate(doc, new Uint8Array(update.data));
  const state = Y.encodeStateVector(doc);
  const encodeUpdate = uint8ToDocUpdateEvent(roomName);
  for (const sub of subs) {
    if (sub !== skipSubscriber) {
      sub(JSON.stringify(encodeUpdate(new Uint8Array(update.data), state)));
    }
  }
};
