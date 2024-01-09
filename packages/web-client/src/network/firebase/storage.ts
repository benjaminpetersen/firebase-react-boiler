import { storagePaths, fullPaths } from "@chewing-bytes/firebase-standards";
import { getEnv } from "./env";
export const appStoragePaths = storagePaths(getEnv());
export const appFullPaths = fullPaths(getEnv());
