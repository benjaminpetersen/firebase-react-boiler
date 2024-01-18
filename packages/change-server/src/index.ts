import { setupWSConnection } from "./notetaker-collaboration";
import expWs from "express-ws";

const express = require("express");
const path = require("path");
const app = express();
const port = 8080;

expWs(app);

app.use("/", express.static(path.join(__dirname, "../web-client-build")));

app.ws("/notetaker-collaboration/:document", (ws, req) => {
  console.log("Connecting");
  return setupWSConnection(ws, req, { docName: req.params.document });
});

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
