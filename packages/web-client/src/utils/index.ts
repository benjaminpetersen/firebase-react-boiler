export const logError: typeof console.log = console.log;
export const log =
  (pre: string) =>
  (...args: Parameters<typeof console.log>) =>
    console.log(`[${pre}]`, ...args);
export const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));
