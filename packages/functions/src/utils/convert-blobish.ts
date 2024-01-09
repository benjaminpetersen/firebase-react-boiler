export const objToBlob = (o: object) => new Blob([JSON.stringify(o)]);
export const bufferToStr = (b: ArrayBufferLike) => new TextDecoder().decode(b);
