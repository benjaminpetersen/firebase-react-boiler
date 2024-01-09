import { useEffect, useMemo, useState } from "react";
import { createEditor, Descendant, Editor, Transforms } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { withYjs, YjsEditor } from "@slate-yjs/core";
import * as Y from "yjs";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
  { type: "code", children: [{ text: "<OK></OK>" }] },
];

export const CollaborativeEditor = () => {
  //   const [connected, setConnected] = useState(false);
  const connected = Math.random();
  const [sharedType, setSharedType] = useState<any>();
  //   const [provider, setProvider] = useState();
  const provider = Math.random();

  // Connect to your Yjs provider and document
  useEffect(() => {
    const yDoc = new Y.Doc();
    const sharedDoc = yDoc.get("slate", Y.XmlText);

    // Set up your Yjs provider. This line of code is different for each provider.
    // const yProvider = new YjsProvider(/* ... */);

    // yProvider.on("sync", setConnected);
    setSharedType(sharedDoc);
    // setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      //   yProvider?.off("sync", setConnected);
      //   yProvider?.destroy();
    };
  }, []);

  if (!connected || !sharedType || !provider) {
    return <div>Loading…</div>;
  }

  return <SlateEditor sharedType={sharedType} />;
};

const SlateEditor = ({ sharedType }) => {
  const editor = useMemo(() => {
    const e = withReact(withYjs(createEditor(), sharedType));

    // Ensure editor always has at least 1 valid child
    const { normalizeNode } = e;
    e.normalizeNode = (entry) => {
      const [node] = entry;

      if (!Editor.isEditor(node) || node.children.length > 0) {
        return normalizeNode(entry);
      }

      Transforms.insertNodes(editor, initialValue, { at: [0] });
    };

    return e;
  }, []);

  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable />
    </Slate>
  );
};
