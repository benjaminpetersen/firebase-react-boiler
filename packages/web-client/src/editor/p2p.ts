import DiffMatchPatch from "diff-match-patch";
import { Delta, SharedType } from "./types";

export const getDeltasFromMdContent =
  (oldMdContent: string) => (mdContent: string) => {
    const dmp = new DiffMatchPatch();
    //   -1 remove +1 add 0 mainain
    const diffs: [number, string][] = dmp.diff_main(oldMdContent, mdContent);
    //   deltas {retain: num, delete: num, insert: "char"};
    return diffs.map(([type, string]): Delta => {
      if (type === -1) return { delete: string.length };
      if (type === 0) return { retain: string.length };
      return { insert: string };
    });
  };

export const getAndApplyDeltas =
  (textStore: SharedType) => (mdContent: string) =>
    textStore.applyDelta(getDeltasFromMdContent(textStore.toJSON())(mdContent));
