// The general idea is to keep a default set of strings with expansion values that users can hit tab to fill in, in the future they will have user preferences that overrides this!
import Fuse from "fuse.js";

export type IReplace = {
  // relative to start of text expansion
  start?: number;
  end?: number;
  //   The value to replace with.
  value: string;
};

export type ITextExpansion = {
  value: string;
  tag: string;
  description?: string;
  replace: IReplace;
};

const defaultTextExpansions: ITextExpansion[] = [
  {
    value: "[ ]",
    tag: "TODO",
    replace: {
      value: "@/[ ]",
    },
  },
  {
    value: "[test",
    tag: "DELETE THIS",
    replace: { value: "passed?" },
  },
  {
    value: "[test1",
    tag: "DELETE THIS",
    replace: { value: "passed?" },
  },
  {
    value: "[test2",
    tag: "DELETE THIS",
    replace: { value: "passed?" },
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

const fuseOptions = {
  // isCaseSensitive: false,
  // includeScore: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: ["value"],
};

export const filterExpansions = (
  { expansions }: Pick<ReturnType<typeof useTextExpansions>, "expansions">,
  searchSpace: string,
) => {
  const fuse = new Fuse(expansions, fuseOptions);
  return expansions.filter((expansion) => {
    // Match if expansion.value has any overlap with the subStr.
    const subStr = searchSpace.slice(
      searchSpace.length - expansion.value.length,
    );
    return fuse.search(subStr).length > 0;
  });
};
