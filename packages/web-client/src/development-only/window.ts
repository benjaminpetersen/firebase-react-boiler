// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { getEnv } from "../network/firebase/env";
import { devLogger } from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setWindowD = (d: any) => {
  if (getEnv() === "production" || getEnv() === "stage") return;
  if (typeof window.d === "undefined") window.d = d;
  else {
    devLogger("couldn't set", d, "already set", window.d);
  }
};
