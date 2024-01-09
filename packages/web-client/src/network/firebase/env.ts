const env = {
  env:
    localStorage.getItem("env") ||
    `${import.meta.env.VITE_APP_ENV || "development"}`,
  emulator:
    localStorage.getItem("is-emulator") !== null
      ? localStorage.getItem("is-emulator") === "true"
      : Boolean(import.meta.env.VITE_APP_USE_EMULATOR),
};
export const setEnv = (upd: Partial<typeof env>) => {
  if (upd.emulator !== undefined)
    localStorage.setItem("is-emulator", upd.emulator ? "true" : "false");
  if (upd.env !== undefined) localStorage.setItem("env", upd.env);
  Object.assign(env, upd);
};
export const getEnv = () => env.env;
export const isEmulator = () => env.emulator;
