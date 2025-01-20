import * as Y from "yjs";
export type SharedType = Y.Text;

// From yjs, used by new Y.Doc().get().applyDelta
export type Delta =
  | { retain: number }
  | { delete: number }
  | { insert: string };
