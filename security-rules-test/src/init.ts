import {
  documentLocations,
  fullPaths,
} from "@chewing-bytes/firebase-standards";
import { initializeApp } from "firebase-admin";
export const init = () => {
  initializeApp();
};
// Has to match functions - ENV_APP_ENV="emulator"
export const env = "emulator";
export const bucket = "playgroundfree.appspot.com";
export const appDbPaths = documentLocations(env);
export const appStoragePaths = fullPaths(env);
