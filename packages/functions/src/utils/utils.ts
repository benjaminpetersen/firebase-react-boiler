export const removeLastPathPart = (str: string) =>
  str.split("/").slice(0, -1).join("/");
