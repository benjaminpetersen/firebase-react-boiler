import { useEffect, useRef } from "react";

const testString = `# Style
\t.bold:
\t\tfont-weight: bold;
# Initiatives
\tRegex
\t\tstart: /!sms (\\d{10})/
\t\tcall: HTTP POST http://localhost:3001/test
\t\tbody: "{\\"phoneNumber\\": \\"$1\\", \\"keywatever2\\": \\"could be constant strings 2?\\"}"
\t\tdescription: "GACK"
\t\texample: "!sms 5555555555"
\tBot
\t\tsomebot that responds? meeeh
# The goal
I want to be able to type here and matching text to the regex for !sms 5879826024 should 
`;
/**
 * In the previous excersize and this one i'm really missing an organic way to find the following:
 * - The parent(s)
 * - The nearest header of a known magnitude
 * - The siblings
 * - The children
 **
 */

// parents - backwards for the nearest number of tabs -1
// header - backwards for the nearest header in a lesser tab group - get all in order
// siblings - forwards and backwards, equal tabs, any less cancels the search
// children - forwards - less you cancel, more tabs continues past them?
// all of these need a direction to iterate over lines, a tab count, a way to cancel the iteration

const tabCount = (s: string) => /^\t*/.exec(s)?.[0]?.length || 0;
const headerCount = (s: string) => /^\t*(#+)/.exec(s)?.[1]?.length || 0;
// const iter = <T,>(next: (t:T)=>boolean, prev: (t:T)=>boolean)=>{}
// so given a line of an array iterate forward or backwards in search and produce the tab counts of each line...
type LineData = {
  tabs: number;
  // 0 for normal text
  header: number;
  text: string;
};

type Predicate = (currentLine: LineData, originalLine: LineData) => boolean;
const textToLineData = (text: string) => ({
  text,
  header: headerCount(text),
  tabs: tabCount(text),
});

// i changed ma mind again.
// looks like the nices api would be a lines class that has associated methods
// a search to find the next something, and a way to continue that search and return an array of results until some condition to cancel the search is met.
const iter =
  (arr: string[]) =>
  ({
    direction,
    shouldTerminateSearch,
    isMatch,
    startIndex,
    firstOrLast = "first",
  }: {
    startIndex: number;
    shouldTerminateSearch?: Predicate;
    isMatch: Predicate;
    direction: "forward" | "backward";
    firstOrLast?: "first" | "last";
  }): { lastFindIndex?: number; firstFindIndex: number | "none" } => {
    const ori = textToLineData(arr[startIndex] || "");
    let lastFindIndex: number;
    let firstFindIndex: number | "none" = "none";
    for (
      let i = direction === "backward" ? startIndex - 1 : startIndex + 1;
      direction === "backward" ? i >= 0 : i < arr.length;
      direction === "backward" ? i-- : i++
    ) {
      const text = arr[i] || "";
      const curr = textToLineData(text);
      if (isMatch(curr, ori)) {
        if (firstFindIndex === "none") firstFindIndex = i;
        lastFindIndex = i;
      }
      if (
        (firstOrLast === "first" && firstFindIndex !== "none") ||
        (shouldTerminateSearch && shouldTerminateSearch(curr, ori))
      )
        break;
    }
    return { lastFindIndex, firstFindIndex };
  };

export const Comp = () => {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current as HTMLElement;
    if (!el) return;
    // goals, hide style and hide iter and it's children
    const lines = testString.split("\n");
    const linesIterator = iter(lines);
    const styleStart = lines.findIndex((l) => l.startsWith("# Style"));
    // findChildren search!
    const styleEnd = linesIterator({
      startIndex: styleStart,
      direction: "forward",
      isMatch: (c, o) => c.tabs > o.tabs,
      firstOrLast: "last",
      shouldTerminateSearch: (c, o) => c.tabs <= o.tabs,
    }).lastFindIndex;
    const inisStart = lines.findIndex((l) => l.startsWith("# Initiatives"));
    const inisEnd = linesIterator({
      startIndex: inisStart,
      direction: "forward",
      isMatch: (c, o) => c.tabs > o.tabs,
      firstOrLast: "last",
      shouldTerminateSearch: (c, o) => c.tabs <= o.tabs,
    }).lastFindIndex;
    lines
      .filter((_l, i) => i > inisEnd)
      .forEach((line) => {
        console.log("APPEND", line);
        const div = document.createElement("div");
        div.appendChild(document.createTextNode(line));
        el.appendChild(div);
      });
  });
  return (
    <div contentEditable ref={ref}>
      some start
    </div>
  );
};
