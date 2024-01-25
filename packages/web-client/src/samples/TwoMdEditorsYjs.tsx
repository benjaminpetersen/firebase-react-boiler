import Md from "../markdown";
import * as Y from "yjs";
import { useEffect, useMemo, useState } from "react";

import DiffMatchPatch from "diff-match-patch";

/**
 * TODO
 * break this down into 3 parts
 * Editing: take changes and apply to md. (Eventually contentEditable, but for now textfield direct edits!)
 * Rendering md to view (<MarkdownView />)
 * P2P - DiffMatchPatch the md and apply to yjs
 * Edit -> md   -> Render
 *              -> P2P
 *
 * yDoc has encode state as update and apply update, the websocket would have on change <->
 */

const useSync = (ydoc1: Y.Doc, ydoc2: Y.Doc, t1: Y.Text, t2: Y.Text) => {
  useEffect(() => {
    t1.observeDeep(() => {
      const update = Y.encodeStateAsUpdate(ydoc1);
      Y.applyUpdate(ydoc2, update);
    });
    t2.observeDeep(() => {
      const update = Y.encodeStateAsUpdate(ydoc2);
      Y.applyUpdate(ydoc1, update);
    });
  }, []);
};

const useDoc = () =>
  useMemo(() => {
    const ydoc = new Y.Doc();
    return [ydoc, ydoc.getText("demo")] as const;
  }, []);

const useYTxt = (t: Y.Text) => {
  const [txt, setTxt] = useState("");
  t.observe(() => {
    setTxt(t.toJSON());
  });
  return txt;
};

const TwoMdEditorsYjs = () => {
  const [doc1, st1] = useDoc();
  const [doc2, st2] = useDoc();
  useSync(doc1, doc2, st1, st2);
  return (
    <div>
      <h1>demo on yjs</h1>
      <Md
        setValue={(v) => {
          const dmp = new DiffMatchPatch();
          //   -1 remove +1 add 0 mainain
          const diffs: [number, string][] = dmp.diff_main(st1.toJSON(), v);
          //   deltas {retain: num, delete: num, insert: "char"};
          type Delta =
            | { retain: number }
            | { delete: number }
            | { insert: string };
          const deltas = diffs.flatMap(([type, string]): Delta[] => {
            if (type === -1) return [{ delete: string.length }];
            if (type === 0) return [{ retain: string.length }];
            return [{ insert: string }];
          });
          st1.applyDelta(deltas);
        }}
        value={useYTxt(st1)}
      />
      <Md setValue={() => {}} value={useYTxt(st2)} />
    </div>
  );
};

export default TwoMdEditorsYjs;
