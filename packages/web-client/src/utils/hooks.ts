import React, { useEffect } from "react";
import { RD, RemoteData } from "@chewing-bytes/remote-data";
import { AppErr } from "../domains/errors";
import { logError } from "../network/firebase/db";

export const promiseToRD = <D, E>({
  set,
  pr,
  mapError,
}: {
  mapError: (e: unknown) => E;
  set: (rd: RemoteData<D, E>) => void;
  pr: Promise<D>;
}) => {
  set(RD.pending);
  pr.then((v) => set(RD.success(v))).catch((err) => {
    logError(err);
    set(RD.failure(mapError(err)));
  });
};

export const useRDFromPromise = <RT>(
  pr: Promise<RT>,
  opts?: { mapErr?: (u: unknown) => AppErr },
) => {
  const [remoteData, setRemoteData] = React.useState<RemoteData<RT, AppErr>>(
    RD.initialized,
  );
  useEffect(() => {
    promiseToRD({
      mapError: (u: unknown): AppErr => opts?.mapErr?.(u) || {},
      pr,
      set: setRemoteData,
    });
  }, [pr, setRemoteData]);
  return remoteData;
};

const evToXY = (
  evt: { clientX: number; clientY: number },
  canv: Pick<
    HTMLCanvasElement,
    | "offsetHeight"
    | "offsetLeft"
    | "scrollLeft"
    | "scrollTop"
    | "getBoundingClientRect"
  >,
) => {
  const { width, height, left, top } = canv.getBoundingClientRect();
  const xPx = evt.clientX - left + canv.scrollLeft;
  const x = xPx / width;
  const yPx = evt.clientY - top + canv.scrollTop;
  const y = yPx / height;
  return { x, y };
};
