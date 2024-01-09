import {
  getDocBuilder,
  setDocBuilder,
  setDocByIdBuilder,
  updateDocBuilder,
} from "@chewing-bytes/firebase-standards";
import { getEnv } from "../utils/env";

import { getFirestore } from "firebase-admin/firestore";

export const appGetDoc = getDocBuilder(async (path) => {
  const doc = await getFirestore().doc(path).get();
  const data = doc.data();
  if (!data) return;
  return { data, id: doc.id };
})(getEnv());

export const appSetDoc = setDocBuilder(async (path, data) => {
  const res = await getFirestore().collection(path).add(data);
  return { id: res.id };
})(getEnv());

export const appSetDocById = setDocByIdBuilder(async (path, data) => {
  await getFirestore().doc(path).set(data);
})(getEnv());
export const appUpdateDoc = updateDocBuilder(async (path, data) => {
  await getFirestore().doc(path).update(data);
})(getEnv());
