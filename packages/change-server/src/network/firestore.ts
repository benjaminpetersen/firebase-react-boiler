import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp({ projectId: "bp-playground" });
const firestore = getFirestore("doc-changes");
export const saveUpdate = async ({
  roomName,
  update,
}: {
  roomName: string;
  update: Uint8Array;
}) =>
  firestore.collection(`development/doc-updates/${roomName}`).add({
    update: Array.from(update),
    createdAt: FieldValue.serverTimestamp(),
  });
