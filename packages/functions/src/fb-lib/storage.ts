import { bufferToStr } from "../utils/convert-blobish";
import { storage } from "./init";

export const uploadFile = (bucket: string, gsPath: string, file: string) => {
  return storage.bucket(bucket).file(gsPath).save(file);
};

export const downloadJSON = async <T = object>(
  bucket: string,
  gsPath: string,
): Promise<T> => {
  const f = storage.bucket(bucket).file(gsPath);
  const dl = await f.download();
  const res = JSON.parse(bufferToStr(dl[0].buffer)) as unknown as T;
  return res;
};
