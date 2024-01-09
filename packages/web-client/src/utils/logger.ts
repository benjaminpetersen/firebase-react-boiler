import { getEnv } from "../network/firebase/env";

export const devLogger = (...args: Parameters<typeof console.log>) => {
  if (getEnv() === "production" || getEnv() === "stage") return;
  console.log("[DEVLOGGER]", ...args);
};
