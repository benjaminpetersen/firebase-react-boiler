import React, { useCallback } from "react";
import isHotkey from "is-hotkey";
import { Editable, useSlate, Slate } from "slate-react";
import { Editor, Transforms, Descendant, Element as SlateElement } from "slate";
import { RichComponents } from "./editor/rich-components/RichBlocks";
import { LeafComponents } from "./editor/rich-components/Leafs";
import { filterExpansions, useTextExpansions } from "./editor/expansions";
import { useContextMenu } from "./containers/contextMenu";
import { ExpansionsContextMenu } from "./editor/components/ExpansionsContextMenu";

// import { withHistory } from "slate-history";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

type IconTypes =
  | "format_bold"
  | "format_italic"
  | "format_underlined"
  | "code"
  | "looks_one"
  | "looks_two"
  | "format_quote"
  | "format_list_numbered"
  | "format_list_bulleted"
  | "format_align_left"
  | "format_align_center"
  | "format_align_right"
  | "format_align_justify";

const iconTypeToJSX = (t: IconTypes): React.ReactNode => {
  switch (t) {
    case "code":
      return "C";
    case "format_align_center":
      return "J-C";
    case "format_align_justify":
      return "J-J";
    case "format_align_left":
      return "J-L";
    case "format_align_right":
      return "J-R";
    case "format_bold":
      return "B";
    case "format_italic":
      return "I";
    case "format_list_bulleted":
      return "*";
    case "format_list_numbered":
      return "123";
    case "format_quote":
      return '""';
    case "format_underlined":
      return "U";
    case "looks_one":
      return "<(.)>1";
    case "looks_two":
      return "<(.)>2";
  }
};

const Icon = ({
  children,
  active,
}: {
  children: IconTypes;
  active?: boolean;
}) => (
  <span style={{ fontWeight: active ? "bold" : "inherit" }}>
    {iconTypeToJSX(children)} /{" "}
  </span>
);
const Button = (props) => <button {...props}>{props.children}</button>;

const RichEditor = ({ sharedType, editor }) => {
  const renderElement = useCallback(
    (props) => <RichComponents {...props} />,
    [],
  );
  const renderLeaf = useCallback((props) => <LeafComponents {...props} />, []);
  const { expansions, maxLen } = useTextExpansions();
  const setContextMenu = useContextMenu()[1];
  return (
    <div className="debug">
      <Slate editor={editor} initialValue={initialValue}>
        <div className="toolbar">
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <MarkButton format="code" icon="code" />
          <BlockButton format="heading-one" icon="looks_one" />
          <BlockButton format="heading-two" icon="looks_two" />
          <BlockButton format="block-quote" icon="format_quote" />
          <BlockButton format="numbered-list" icon="format_list_numbered" />
          <BlockButton format="bulleted-list" icon="format_list_bulleted" />
          <BlockButton format="left" icon="format_align_left" />
          <BlockButton format="center" icon="format_align_center" />
          <BlockButton format="right" icon="format_align_right" />
          <BlockButton format="justify" icon="format_align_justify" />
        </div>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
          onKeyDown={(event) => {
            const { anchorNode, anchorOffset } = window.getSelection();
            const searchSpace =
              (anchorNode instanceof Text ? anchorNode.data : "").slice(
                anchorOffset - maxLen,
                anchorOffset,
              ) + event.key;

            // setContextMenu?;
            const exp = filterExpansions({ expansions }, searchSpace);
            setContextMenu({
              anchorNode: anchorNode,
              offset: { x: "0", y: "0" },
              menu: (
                <ExpansionsContextMenu
                  expansions={exp}
                  onSelect={(exp) => {
                    console.log("SELECT", exp);
                  }}
                />
              ),
            });
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as any)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    }),
  );

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<textarea>", code: true },
      { text: "!" },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: "bold", bold: true },
      {
        text: ", or add a semantically rendered block quote in the middle of the page, like this:",
      },
    ],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    align: "center",
    children: [{ text: "Try it out for yourself!" }],
  },
];

export default RichEditor;
