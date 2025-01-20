// Offline online buttons for this.

import * as Y from "yjs";
import { useCallback, useEffect, useMemo } from "react";
import { Descendant, Editor, Transforms, createEditor } from "slate";
import { YjsEditor, withYjs } from "@slate-yjs/core";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { RichComponents } from "../editor/rich-components/RichBlocks";
import RichEditor from "../RichEditor";

const useYDoc = () => {
  return useMemo(() => {
    const ydoc = new Y.Doc();
    const sharedType = ydoc.getXmlFragment("demo");
    return [ydoc, sharedType] as const;
  }, []);
};

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const useEditor = (sharedType) => {
  return useMemo(() => {
    const e = withReact(withYjs(createEditor(), sharedType));
    const { normalizeNode } = e;
    e.normalizeNode = (entry) => {
      const [node] = entry;

      if (!Editor.isEditor(node) || node.children.length > 0) {
        return normalizeNode(entry);
      }

      Transforms.insertNodes(e, initialValue, { at: [0] });
    };

    return e;
  }, []);
};

const useSync = (
  ydoc1: Y.Doc,
  ydoc2: Y.Doc,
  ed1: YjsEditor,
  ed2: YjsEditor,
) => {
  useEffect(() => {
    const d = ydoc1.getXmlFragment("demo");
    console.log(d);
    d.observe((ev) => {
      console.log("RAN");
    });
    // ydoc1.on("update", (update) => {
    //   Y.applyUpdate(ydoc2, update);
    // });
    ydoc2.on("update", (update) => {
      console.log("RAN2");
      Y.logUpdate(update);
      Y.applyUpdate(ydoc1, update);
    });
  }, []);
};

const Ed = ({ ed }: { ed: ReactEditor }) => {
  return (
    <Slate editor={ed} initialValue={initialValue}>
      <Editable />
    </Slate>
  );
};

export const TwoEditorsSameBrowser = () => {
  const [ydoc1, st1] = useYDoc();
  const [ydoc2, st2] = useYDoc();
  const ed1 = useEditor(st1);
  const ed2 = useEditor(st2);
  useSync(ydoc1, ydoc2, ed1, ed2);
  return (
    <div>
      <div style={{ border: "2px solid black", width: "100%" }}>
        ed 1 <Ed ed={ed1} />
      </div>
      <div style={{ border: "2px solid black", width: "100%" }}>
        ed 2 <Ed ed={ed2} />
      </div>
    </div>
  );
};
export default TwoEditorsSameBrowser;
