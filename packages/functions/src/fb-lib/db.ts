import { firestore } from "./init";

export const hardDeleteDocById = (path: string) => firestore.doc(path).delete();
