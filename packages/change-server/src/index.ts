import { setupWSConnection } from "./notetaker-collaboration/utils";
import expWs from "express-ws";
import * as Y from "yjs";
import * as _ from "lodash";
import {
  emitToRooms,
  subscribeToRoom,
} from "./notetaker-collaboration/memcache";
const roomName = "bplocal";
const express = require("express");
const path = require("path");
const app = express();
const port = 8080;
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
const saveChanges = _.throttle(_saveChanges, 10000);
const loadFile = async (roomName: string) => {
  const f = s.bucket(bucket).file(roomStashLocation(roomName));
  if (await f.exists().then((d) => d[0])) {
    const dl = await f.download();
    return dl[0];
  } else return undefined;
};

expWs(app);

app.use("/", express.static(path.join(__dirname, "../web-client-build")));
/**
 * TODO - Gcloud tutorial about websockets on cloud run gives an example of using redis for this to work at scale.
 * Currently when a second instance get's created we may not connect to the same instance.
 */
let wsConnections = 0;
let count = 0;
app.ws("/md-notetaker-collaboration", async (ws, req) => {
  wsConnections++;
  const seshId = wsConnections;
  console.log("Create Connection", roomName, seshId);
  const messageHandler = (msg: string) => {
    console.log("Passing message", { Id: seshId }, count++);
    ws.send(msg);
  };
  const unsub = subscribeToRoom(roomName, messageHandler);
  ws.on("message", (msg: string) => {
    console.log("Client msg in");
    emitToRooms(roomName, msg, messageHandler);
  });
  ws.on("close", () => {
    unsub();
    console.log(`Close Connection`, roomName, seshId);
  });
});

app.ws("/notetaker-collaboration/:document", async (ws, req) => {
  // how to backup file? on every update call a write that I'll throttle
  // on load get my file!
  const docName = req.params.document;
  // somehow this prevents the websocket from syncing?
  // await new Promise((r) => setTimeout(r, 10));
  const ydoc = await setupWSConnection(ws, req, { docName });
  const persistedDoc = await loadFile(req.params.document).catch((e) => {
    console.error("E", e);
    return undefined;
  });
  if (persistedDoc) {
    Y.applyUpdate(ydoc, persistedDoc);
  }
  // this needs to go after the setup for some reason. I suspect some timeout

  // console.log("SETUP?", persistedDoc);
  ydoc.on("update", (update) => {
    const stateVector = Y.encodeStateVector(ydoc);
    // don't have prev?
    // console.log("PLS PLS PLS", Y.logUpdate(Y.encodeStateVectorFromUpdate()));
    // console.log("args", ...args.map((t) => typeof t));

    console.log("\n\n\nState:");
    Y.logUpdate(Y.encodeStateAsUpdate(ydoc));
    console.log("\n\n\nCHANGE:");
    Y.logUpdate(update);

    // console.log("DELTA", update);
    saveChanges(ydoc, docName);
  });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
