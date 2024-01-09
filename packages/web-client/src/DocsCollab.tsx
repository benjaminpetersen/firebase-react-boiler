import { useCallback, useEffect, useMemo, useState } from "react";
import { createEditor, Descendant, Editor, Transforms } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { withYjs, YjsEditor } from "@slate-yjs/core";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { roomName } from "./refactor";
import { CodeElement, DefaultElement } from "./editor-components";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
  { type: "code", children: [{ text: "<OK></OK>" }] },
];

export const CollaborativeEditor = () => {
  const [connected, setConnected] = useState(false);
  const [sharedType, setSharedType] = useState<any>();
  const [provider, setProvider] = useState<WebsocketProvider>();

  // Connect to your Yjs provider and document
  useEffect(() => {
    const yDoc = new Y.Doc();
    const sharedDoc = yDoc.get("slate", Y.XmlText);

    // Set up your Yjs provider. This line of code is different for each provider.

    const yProvider = new WebsocketProvider(
      `ws://localhost:${import.meta.env.VITE_APP_DOC_CHANGE_WS_PORT}`,
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
  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  return (
    <div>
      <h1></h1>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable renderElement={renderElement} />
      </Slate>
    </div>
  );
};
