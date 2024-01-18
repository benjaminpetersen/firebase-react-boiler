import { ref, uploadBytesResumable, getBytes } from "firebase/storage";
import { storage } from "./init";
import { RemoteData } from "@chewing-bytes/remote-data";
import { wrap } from "lodash-es";
import { AppErr } from "./types";
import { logError } from "../../utils";

const getRef = (...pathParts: string[]) => ref(storage, pathParts.join("/"));

export const removeFileExt = (name: string) => {
  const fileParts = name.split(".");
  fileParts.pop();
  return fileParts.join(".");
};

export const getFileExt = (name: string) => name.split(".").pop();

const ratioToPercent = (ratio: number) => Math.floor(ratio * 100);

export const uploadFile = async ({
  file,
  fullPath,
}: {
  file: File;
  fullPath: string;
}) => {
  const storageRef = getRef(fullPath);
  const task = uploadBytesResumable(storageRef, file);
  return {
    fileName: storageRef.name,
    fullPath: storageRef.fullPath,
    onProgress: (cb: (percent: number) => void) => {
      task.on("state_changed", {
        next: (value) =>
          cb(ratioToPercent(value.bytesTransferred / value.totalBytes)),
      });
    },
    onError: (cb: (err: AppErr) => void) => {
      task.catch((e) => {
        logError(e);
        cb({ msg: "Failed to upload" });
      });
    },
    onComplete: (cb: (gsUri: string) => void) =>
      task.then((d) => cb(`gs://${d.ref.bucket}/${d.ref.fullPath}`)),
  };
};

export const gsUriToBytes = async (location: { gsUri: string }) =>
  getBytes(getRef(location.gsUri));

export type FileAndGsUri<FileType = File> = { gsUri: string; file: FileType };
export type FileRD<FileType = File> = RemoteData<
  FileAndGsUri<FileType>,
  AppErr
>;
const _gsUriToFile = async ({
  gsUri,
  name,
}: {
  gsUri: string;
  name?: string;
}) => {
  const file = new File(
    [await gsUriToBytes({ gsUri })],
    name || gsUri.split("/").pop() || "file",
  );
  return file;
};

// 10min
const fileTTL = 10 * 60 * 1000;
type FileCache = {
  fetchedAt: number;
  filePromise: Promise<File>;
  gsUri: string;
};
const fileCache = new Map<string, FileCache>();

export const gsUriToFile = wrap(
  _gsUriToFile,
  (gsUriToFile, ...params: Parameters<typeof _gsUriToFile>) => {
    const { gsUri, name } = params[0];
    const cachedFile = fileCache.get(gsUri);
    const fetchedAt = cachedFile?.fetchedAt || 0;
    const cacheExpired = fetchedAt + fileTTL < Date.now();
    const res: FileCache =
      cachedFile && !cacheExpired
        ? cachedFile
        : {
            fetchedAt: Date.now(),
            filePromise: gsUriToFile({ gsUri, name }),
            gsUri,
          };
    fileCache.set(gsUri, res);
    return res.filePromise;
  },
);
