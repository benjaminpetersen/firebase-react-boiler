import { useEffect } from "react";
import { SharedType } from "../editor/types";
import { sleep } from "../utils";
import {
  strToDocUpdate,
  uint8ToDocUpdateEvent,
} from "@chewing-bytes/firebase-standards";
import { roomName } from "../refactor";
import * as Y from "yjs";

const listeners = [];
// TODO: hmr screws up here so I store on the window. I'm sure there's an easier fix.
const setWs = (ws: WebSocket) => {
  // @ts-ignore
  window.docChangesWebSocket = ws;
};
const getWs = () => {
  const ws =
    // @ts-ignore
    window.docChangesWebSocket;
  return ws as WebSocket | undefined;
};
let isOpen: Promise<void>;
const connect = () => {
  // @ts-ignore
  console.log("WebSocket Connecting...");
  const oldWs = getWs();
  if (oldWs) {
    // remove the onClose and close it
    oldWs.onclose = null;
    oldWs.close();
  }
  const ws = new WebSocket(import.meta.env.VITE_APP_MD_DOC_CHANGE_WS);
  setWs(ws);
  isOpen = new Promise((r) => {
    ws.onopen = () => {
      r();
    };
  });
  ws.onclose = () => {
    sleep(2000).then(() => {
      console.log("WebSocket Disconnected.");
      connect();
    });
  };
  ws.onmessage = (event) => {
    const msg = typeof event.data === "string" ? event.data : undefined;
    if (!msg) {
      console.error("Empty WebSocket Message", event);
      return;
    }

    for (const cb of listeners) {
      cb(msg);
    }
  };
};
connect();
const replace = <T>(arr: T[], newArr: T[]) => {
  arr.splice(0, arr.length, ...newArr);
};
const listen = (onMsg: (msg: string) => void) => {
  listeners.push(onMsg);
  return () => {
    replace(
      listeners,
      listeners.filter((cb) => cb !== onMsg),
    );
  };
};

export const useLiveConnection = (t: SharedType) => {
  useEffect(() => {
    let serverState: Uint8Array | undefined;
    const onDocUpdate = async (update) => {
      await isOpen;
      const upd = serverState
        ? Y.encodeStateAsUpdate(t.doc, serverState)
        : update;
      // For some reason empty updates have 2 0's
      if (upd.length > 2)
        getWs().send(JSON.stringify(uint8ToDocUpdateEvent(roomName)(upd)));
    };
    const unsub = listen((msg) => {
      console.log("WebSocket Client received", msg);
      const upd = strToDocUpdate(msg);
      if (!upd) {
        console.error("Failed to parse update", msg);
        return;
      }
      if (upd.serverState) serverState = new Uint8Array(upd.serverState);
      // it may well be worth changing this goofy encoding.
      console.log("applyUpdate", new Uint8Array(upd.data));
      Y.applyUpdate(t.doc, new Uint8Array(upd.data));
    });
    t.doc.on("update", onDocUpdate);
    return () => {
      t.doc.off("update", onDocUpdate);
      unsub();
    };
  }, [t]);
};
