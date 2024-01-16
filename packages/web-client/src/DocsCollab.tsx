import React, { Suspense, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { renderElement } from "./utils/renderEditorElement";
const LazyCollabEditor = React.lazy(() => import("./LazyYjs"));
const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

export const SlateEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Suspense
      fallback={
        <div>
          <Slate editor={editor} initialValue={initialValue}>
            <Editable renderElement={renderElement} />
          </Slate>
        </div>
      }
    >
      <LazyCollabEditor />
    </Suspense>
  );
};
