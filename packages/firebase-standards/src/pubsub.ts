import * as z from "zod";
const docUpdateEvent = z.object({
  type: z.literal("doc-update"),
  data: z.array(z.number()),
  // Only the server sends it's state to clients.
  serverState: z.array(z.number()).optional(),
  roomName: z.string(),
});
export type DocUpdateEvent = z.infer<typeof docUpdateEvent>;
export const strToDocUpdate = (s: string) => {
  try {
    return docUpdateEvent.parse(JSON.parse(s));
  } catch (error) {
    console.error("Failed str to doc parse", s, error);
    return undefined;
  }
};
export const uint8ToDocUpdateEvent =
  (roomName: string) =>
  (data: Uint8Array, serverState?: Uint8Array): DocUpdateEvent => ({
    type: "doc-update",
    roomName,
    data: Array.from(data),
    serverState: serverState ? Array.from(serverState) : undefined,
  });
