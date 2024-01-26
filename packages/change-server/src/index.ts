import { setupWSConnection } from "./notetaker-collaboration/utils";
import expWs from "express-ws";
import * as Y from "yjs";
import * as _ from "lodash";
import {
  emitToRooms,
  getDoc,
  subscribeToRoom,
} from "./notetaker-collaboration/memcache";
import { loadFile, saveChanges } from "./network/storage";
import {
  decodeDocUpdate,
  uint8ToDocUpdateEvent,
} from "@chewing-bytes/firebase-standards";
const roomName = "bplocal";
const express = require("express");
const path = require("path");
const app = express();
const port = 8080;

expWs(app);

app.use("/", express.static(path.join(__dirname, "../web-client-build")));
/**
 * TODO - Gcloud tutorial about websockets on cloud run gives an example of using redis for this to work at scale.
 * Currently when a second instance get's created we may not connect to the same instance.
 */
let wsConnections = 0;
let count = 0;
app.ws("/md-notetaker-collaboration", async (ws, req) => {
  /**
   * 1. Client connects with it's current state
   * 2. Connect to existing data (mem / load from file service) / send over the whole of the data
   */
  // create connection should also emit the doc state?
  wsConnections++;
  const seshId = wsConnections;
  console.log("Create Connection", roomName, seshId);
  const messageHandler = (msg: string) => {
    console.log("Passing message", { Id: seshId }, count++);
    ws.send(msg);
  };
  const unsub = subscribeToRoom(roomName, messageHandler);
  ws.on("message", async (msg: string) => {
    const update = decodeDocUpdate(msg);
    if (update.type === "doc-update") {
      //add a connect types
      emitToRooms(roomName, msg, messageHandler).catch((e) => {
        console.error("Failed to propagate message", e);
      });
    } else if (update.type === "doc-connect") {
      // send the full current ydoc
      const ydoc = await getDoc(roomName);
      Y.applyUpdate(ydoc, new Uint8Array(update.fullDoc));
      // ydoc.app
      const upd = Y.encodeStateAsUpdate(ydoc);
      Y.logUpdate(upd);
      ws.send(JSON.stringify(uint8ToDocUpdateEvent(roomName)(upd)));
    }
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
