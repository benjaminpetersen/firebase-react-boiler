import Queue from "queue";
import { CompleteCurrent } from "../components/StatusDropdown";

export const stringToCompleteCurrent = (
  s: string,
): CompleteCurrent | undefined =>
  s === "completed" ? "completed" : s === "current" ? "current" : undefined;

export const promiseQueue = <Cb extends (...args: any[]) => Promise<T>, T>(
  cb: Cb,
) => {
  const q = new Queue({ results: [] });
  q.autostart = true;
  q.concurrency = 1;
  return async (...args: Parameters<Cb>) => {
    // TODO part of this could be compiling updates
    q.push(async () => {
      await cb(...args);
      return true;
    });
  };
};

export const sleep = (ms = 5000) =>
  new Promise((res) => setTimeout(() => res(undefined), ms));
