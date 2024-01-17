import React, { useCallback } from "react";
import isHotkey from "is-hotkey";
import { Editable, useSlate, Slate } from "slate-react";
import type { Descendant } from "slate";
import { RichComponents } from "./editor/rich-components/RichBlocks";
import { LeafComponents } from "./editor/rich-components/Leafs";
import { filterExpansions, useTextExpansions } from "./editor/expansions";
import { useContextMenu } from "./containers/contextMenu";
import { ExpansionsContextMenu } from "./editor/components/ExpansionsContextMenu";
import {
  isBlockActive,
  isMarkActive,
  toggleBlock,
  toggleMark,
} from "./editor/editorMethods";
import { IconTypes, TEXT_ALIGN_TYPES } from "./editor/editorConstants";

// import { withHistory } from "slate-history";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
  "mod+y": "todo",
};

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
          placeholder="Enter some text..."
          spellCheck
          autoFocus
          onKeyDown={(event) => {
            const { anchorNode, anchorOffset } = window.getSelection();
            const txt =
              (anchorNode instanceof Text ? anchorNode.data : "") + event.key;
            const searchSpace = txt.slice(
              anchorOffset + 1 - maxLen,
              anchorOffset + 1,
            );

            const exp = filterExpansions({ expansions }, searchSpace);
            setContextMenu({
              anchorNode: anchorNode,
              offset: { x: "0", y: "0" },
              menu: (
                <ExpansionsContextMenu
                  expansions={exp}
                  onSelect={(exp) => {
                    exp.replace(editor);
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
    children: [{ text: "" }],
  },
];

export default RichEditor;
