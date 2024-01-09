import { Editable, Slate, withReact } from "slate-react";
import "./App.css";
import { useCallback, useState } from "react";
import { Descendant, Editor, Element, Transforms, createEditor } from "slate";
import { CollaborativeEditor } from "./DocsCollab";
const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
  { type: "code", children: [{ text: "<OK></OK>" }] },
];

const CodeElement = (props: any) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};
const DefaultElement = (props) => <p {...props.attributes}>{props.children}</p>;

const App = () => {
  const [editor] = useState(() => withReact(createEditor()));
  // Render the Slate context.
  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);
  if (Math.random()) return <CollaborativeEditor />;
  return (
    <div>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable
          onKeyDown={(event) => {
            if (event.key === "`" && event.ctrlKey) {
              // Prevent the "`" from being inserted by default.
              event.preventDefault();
              // Otherwise, set the currently selected blocks type to "code".
              Transforms.setNodes(
                editor,
                { type: "code" },
                {
                  match: (n) =>
                    Element.isElement(n) && Editor.isBlock(editor, n),
                }
              );
            }
          }}
          renderElement={renderElement}
          // const renderLeaf -- simple span like fnality
          // renderLeaf={}
        />
      </Slate>
    </div>
  );
};

export default App;
