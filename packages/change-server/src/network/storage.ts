import * as Y from "yjs";
import _ from "lodash";
const { Storage } = require("@google-cloud/storage");

const s: Storage = new Storage();
const roomStashLocation = (room) => `room-documents/${room}`;
const bucket = "notetaker-files";
const saveFile = async (content: Uint8Array, roomName: string) => {
  const fpath = roomStashLocation(roomName);
  await s.bucket(bucket).file(fpath).save(Buffer.from(content));
};

const _saveChanges = async (ydoc: Y.Doc, room: string) => {
  const update = Y.encodeStateAsUpdate(ydoc);
  await saveFile(update, room);
};

// save every 10s?
export const saveChanges = _.throttle(_saveChanges, 10000);

export const loadFile = async (roomName: string) => {
  const f = s.bucket(bucket).file(roomStashLocation(roomName));
  if (await f.exists().then((d) => d[0])) {
    const dl = await f.download();
    return dl[0];
  } else return undefined;
};
