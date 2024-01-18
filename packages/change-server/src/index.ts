import { setupWSConnection } from "./notetaker-collaboration";
import expWs from "express-ws";

const express = require("express");
const app = express();
const port = 8080;

expWs(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.ws("/notetaker-collaboration/:document", (ws, req) => {
  console.log("Connecting");
  return setupWSConnection(ws, req, { docName: req.params.document });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
