import * as z from "zod";

const strParse =
  <P extends z.AnyZodObject>(objParse: P) =>
  (s: string, logger?: (err: unknown) => void): z.infer<P> | undefined => {
    try {
      return objParse.parse(JSON.parse(s));
    } catch (error) {
      logger?.(error);
      return undefined;
    }
  };

const docUpdateEvent = z.object({
  type: z.literal("doc-update"),
  data: z.array(z.number()),
  // Only the server sends it's state to clients.
  serverState: z.array(z.number()).optional(),
  roomName: z.string(),
});
export type DocUpdateEvent = z.infer<typeof docUpdateEvent>;
const strToDocUpdate = strParse(docUpdateEvent);
export const uint8ToDocUpdateEvent =
  (roomName: string) =>
  (data: Uint8Array, serverState?: Uint8Array): DocUpdateEvent => ({
    type: "doc-update",
    roomName,
    data: Array.from(data),
    serverState: serverState ? Array.from(serverState) : undefined,
  });

//
const docConnectEvent = z.object({
  type: z.literal("doc-connect"),
  fullDoc: z.array(z.number()),
  // Only the server sends it's state to clients.
  roomName: z.string(),
});
export type DocConnectEvent = z.infer<typeof docConnectEvent>;
const strToDocConnect = strParse(docConnectEvent);
export const uint8ToDocConnect =
  (roomName: string) =>
  (data: Uint8Array): DocConnectEvent => ({
    type: "doc-connect",
    roomName,
    fullDoc: Array.from(data),
  });

export const decodeDocUpdate = (
  s: string,
): DocConnectEvent | DocUpdateEvent | undefined => {
  return strToDocUpdate(s) || strToDocConnect(s);
};
