// The general idea is to keep a default set of strings with expansion values that users can hit tab to fill in, in the future they will have user preferences that overrides this!
import { BaseEditor, Editor } from "slate";
import { isMarkActive, toggleBlock } from "./editorMethods";
import { logError } from "../utils";

export type IReplace = (editor: BaseEditor) => void;

export type ITextExpansion = {
  value: string;
  tag: string;
  prompt?: string;
  description?: string;
  replace: IReplace;
};

const todoSearch = "[ ]";
const deleteBackwardX = (editor: BaseEditor) => (x: number) =>
  Array.from({ length: x }).forEach(() =>
    Editor.deleteBackward(editor, { unit: "character" }),
  );
const defaultTextExpansions: ITextExpansion[] = [
  {
    value: todoSearch,
    tag: "TODO",
    prompt: "Add a todo statement",
    replace: (editor) => {
      // Check if the text matches the start of a block?
      const backspace = deleteBackwardX(editor);
      try {
        const [, path] = Editor.node(editor, editor.selection.anchor.path);
        if (
          editor.selection.anchor.offset === todoSearch.length &&
          Editor.parent(editor, path)[0].children[0]?.text?.startsWith(
            todoSearch,
          )
        ) {
          // TODO if the block is already active add another box as a mark?
          backspace(todoSearch.length);
          toggleBlock(editor, "check-list-item");
          return;
        }
      } catch (error) {
        logError(error);
      }
      if (!isMarkActive(editor, "todo")) {
        backspace(todoSearch.length);
        Editor.addMark(editor, "todo", true);
      } else Editor.removeMark(editor, "todo");
    },
  },
];
const defaultMaxExpansionLength = Math.max(
  ...defaultTextExpansions.map((v) => v.value.length),
);

export const useTextExpansions = () => {
  return {
    maxLen: defaultMaxExpansionLength,
    expansions: defaultTextExpansions,
  };
};

export const filterExpansions = (
  { expansions }: Pick<ReturnType<typeof useTextExpansions>, "expansions">,
  searchSpace: string,
) => {
  return expansions.filter((expansion) => {
    // Match if expansion.value has any overlap with the subStr.
    const subStr = searchSpace.slice(
      searchSpace.length - expansion.value.length,
    );
    return subStr === expansion.value;
  });
};
