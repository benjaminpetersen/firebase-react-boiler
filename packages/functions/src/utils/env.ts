import {
  collectionLocations,
  documentLocations,
} from "@chewing-bytes/firebase-standards";
import { logger } from "firebase-functions";

export const isEmulator = () =>
  process.env.FIREBASE_STORAGE_EMULATOR_HOST === "127.0.0.1:9199";

export const getEnv = () => process.env.ENV_APP_ENV || "emulator";

export const compareEnv = (env: string) => {
  const currentEnv = getEnv();
  return typeof currentEnv === "string" && currentEnv === env;
};

// This should be done at the start of every cloud function invocation
export const assertEnv = (env?: string) => {
  if (!env || !compareEnv(env)) {
    const msg = `Bailing on function, envs not equal: ${getEnv()}!=${env}`;
    logger.info(msg);
    throw new Error(msg);
  }
  return env;
};

export const colPaths = collectionLocations(getEnv());
export const docPaths = documentLocations(getEnv());
