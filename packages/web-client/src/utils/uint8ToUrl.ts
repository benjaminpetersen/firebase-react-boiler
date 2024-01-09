export const uint8ToUrl = (arr: Uint8Array) => {
  const b = new Blob([arr]);
  return URL.createObjectURL(b);
};
