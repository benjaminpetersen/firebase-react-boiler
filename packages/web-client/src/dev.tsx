export const devSESH = "devSesh";
export const devLogger =
  (key: string) =>
  (...args: Parameters<typeof console.log>) => {
    if (key === devSESH) console.log(`[${key}]:`, ...args);
  };
