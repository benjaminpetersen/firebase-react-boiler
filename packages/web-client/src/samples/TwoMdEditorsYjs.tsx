import Md from "../markdown";
import * as Y from "yjs";
import { useMemo, useState } from "react";
import { getAndApplyDeltas } from "../editor/p2p";
import { useLiveConnection } from "../network/doc-changes";

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
  const st1 = useDoc()[1];
  useLiveConnection(st1);
  return (
    <div>
      <h1>demo on yjs</h1>
      <Md setValue={getAndApplyDeltas(st1)} value={useYTxt(st1)} />
    </div>
  );
};

export default TwoMdEditorsYjs;
