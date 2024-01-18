import { useEffect, useMemo, useState } from "react";
import { createEditor, Descendant, Editor, Transforms } from "slate";
import { withReact } from "slate-react";
import { withYjs, YjsEditor } from "@slate-yjs/core";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { roomName } from "./refactor";
import RichEditor from "./RichEditor";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

const CollaborativeEditor = () => {
  const [connected, setConnected] = useState(false);
  const [sharedType, setSharedType] = useState<any>();
  const [provider, setProvider] = useState<WebsocketProvider>();

  // Connect to your Yjs provider and document
  useEffect(() => {
    const yDoc = new Y.Doc();
    const sharedDoc = yDoc.get("slate", Y.XmlText);

    // Set up your Yjs provider. This line of code is different for each provider.

    const yProvider = new WebsocketProvider(
      import.meta.env.VITE_APP_DOC_CHANGE_WS,
      roomName,
      yDoc,
    );

    yProvider.on("status", (event) => {
      console.log(event.status); // logs "connected" or "disconnected"
    });
    // To set this up you pass shared doc to the setup. so it has th emethods, and network input should drill data into it.
    // I ne
    // const yProvider = new YjsProvider(/* ... */); // man this does not makes sense.

    yProvider.on("sync", setConnected);
    setSharedType(sharedDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.off("sync", setConnected);
      yProvider?.destroy();
    };
  }, []);

  // TODO i want to get away from this - ssr / hydrate the values -> connect async
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

  return <RichEditor editor={editor} sharedType={sharedType} />;
};

export default CollaborativeEditor;
