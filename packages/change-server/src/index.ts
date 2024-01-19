import { setupWSConnection } from "./notetaker-collaboration";
import expWs from "express-ws";

const express = require("express");
const path = require("path");
const app = express();
const port = 8080;

const { Storage } = require("@google-cloud/storage");
const s: Storage = new Storage();
const saveFile = (content: object, roomName: string) =>
  s
    .bucket("notetaker-files")
    .file(`room-documents/${roomName}.json`)
    .save(JSON.stringify(content, null, 2));
const loadFile = async (roomName: string) => {
  const f = s.bucket("notetaker-files").file(`room-documents/${roomName}.json`);
  if (await f.exists().then((d) => d[0])) f.download();
  else return undefined;
};

expWs(app);

app.use("/", express.static(path.join(__dirname, "../web-client-build")));

const setupWS = (conn, req, docName) => {
  conn.binaryType = "arraybuffer";
};

app.ws("/notetaker-collaboration/:document", (ws, req) => {
  // how to backup file.
  loadFile(req.params.document)
    .then((doc) => {
      doc?.toJSON().then(console.log);
      // ws.send()
    })
    .catch((e) => {
      console.error("E", e);
    });
  return setupWSConnection(ws, req, { docName: req.params.document });
});

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
