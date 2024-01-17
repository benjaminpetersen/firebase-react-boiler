// The general idea is to keep a default set of strings with expansion values that users can hit tab to fill in, in the future they will have user preferences that overrides this!
import { BaseEditor, Editor } from "slate";
import { isMarkActive } from "./editorMethods";

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
      if (!isMarkActive(editor, "todo")) {
        deleteBackwardX(editor)(todoSearch.length);
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
