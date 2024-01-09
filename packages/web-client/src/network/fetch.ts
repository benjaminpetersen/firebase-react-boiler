import { useRDFromPromise } from "../utils/hooks";
import { logError } from "./firebase/db";

const fetchFile = async ({ url }: { url: string }) => {
  return fetch(url).then((d) => d.arrayBuffer());
};

export const useFetchFilebyUrl = (url: string) =>
  useRDFromPromise(fetchFile({ url }), {
    mapErr: (e) => {
      logError("Failed to load PDF", e);
      return { msg: "Failed to load PDF" };
    },
  });
