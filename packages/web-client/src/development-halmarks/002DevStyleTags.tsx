import { useEffect, useRef, useState } from "react";

export const stagString = `# Styles
\t.bold
\t\tfont-weight: bold;
\t.italics
\t\tfont-style: italics;

# First feature: stag (style tags)

I want to load this document and see this as <style-bold>bold</style-bold> and <style-italics>italics</style-italics> with the tags hidden to the eye.
`;

// TODO validators

type StagParams = {
  className: string;
  openTag: string;
  closeTag: string;
  //  allowable properties to set?
  styles: string;
};

// Needs the tab depth of the current line before finding tab groups bellow
const styleTagRe = /# Style/;
const getNumTabsBySelection = (selection: number) => ``;
const getTabChildren = (nt: string, index: number) => {
  const tabsOf = new RegExp(`(\t${numTabs + 1}.*\n)*`);
};
const getStagParams = (): StagParams[] => {
  return [];
};

// Need some concept of a parser - ideally streaming content... So it's pretty easy to just scan forwards or backwords for children or parents. build an internal model and expose it somehow. That's a big deal rn
// Parser needs to identify headers, tabChildren, tabParentChain, tabSibblings
/**
 * Relevant features to display parser
 ** Style xml tags
 ** Headers and which to hide collapse
 ** Newlines
 
 * Plan
 ** Split \n and count tab length at start of each line. point to the parent

 */
// should take a linked list style stream...
// I'm for sure overthinking
// First iteration could guarantee you get the full doc to parsea
// Second iteration would just get the header fields first and stream where ever the user is, parsing backwards. So first iteration is an excellent chance to do line by line parsing which is reusable.
const tabRe = /\t*/;
const leadingTabCount = (input: string): number =>
  input.match(tabRe)?.[0].length || 0;
type PromiseResRej<T> = {
  res: (t: T) => void;
  rej: (e: Error) => void;
};
const newPrParts = (): [PromiseResRej<LineDetailsO>, Promise<LineDetailsO>] => {
  let res;
  let rej;
  const pr = new Promise<LineDetailsO>((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  return [{ res, rej }, pr];
};

type LineDetailsO = LineDetails | null;

class LineDetails {
  input: string;
  leadingTabCount: number;
  prev: Promise<LineDetailsO>;
  next: Promise<LineDetailsO>;
  parentTabLine: Promise<LineDetailsO>;
  prevResRej: PromiseResRej<LineDetailsO>;
  nextResRej: PromiseResRej<LineDetailsO>;
  parentTabLineResRej: PromiseResRej<LineDetailsO>;
  update: (
    key: "prev" | "next" | "parentTabLine",
    detail: LineDetailsO,
  ) => void;
  constructor(input: string) {
    this.input = input;
    this.leadingTabCount = leadingTabCount(input);

    //
    const [prevResRej, prev] = newPrParts();
    const [nextResRej, next] = newPrParts();
    const [parentTabLineResRej, parentTabLine] = newPrParts();
    this.prevResRej = prevResRej;
    this.prev = prev;
    this.nextResRej = nextResRej;
    this.next = next;
    this.parentTabLineResRej = parentTabLineResRej;
    this.parentTabLine = parentTabLine;
  }
}
// Assuming we have the whole doc
const parseLines = (document: string) => {
  const lines = document.split("\n");
  const lineDetails = lines.map((line) => new LineDetails(line));
  const parentTabLines: LineDetails[] = [];
  lineDetails.forEach((ld, i) => {
    const next = lineDetails[i + 1] || null;
    const prev = lineDetails[i - 1] || null;
    ld.nextResRej.res(next);
    ld.prevResRej.res(prev);
    // for each tab depth we should have a parent tab
    const tabDiff = ld.leadingTabCount - (prev?.leadingTabCount || 0);
    if (tabDiff > 0)
      for (let index = 0; index < tabDiff; index++) parentTabLines.push(prev);
    else if (tabDiff < 0)
      for (let index = 0; index > tabDiff; index--) parentTabLines.pop();
    ld.parentTabLineResRej.res(
      parentTabLines[parentTabLines.length - 1] || null,
    );
  });
  return lineDetails;
};

/**
 * Jobs
 ** 1. Hide config headers and their content
 ** 2. Remove style tags
 ** 3. Insert all the nodes of style tags and apply classes (fairly involved) - e.g. <style-bold>hello <style-italics>me</style-bold> more </style-italics>
 ** 4. put <br/> in place of all \n
 * @param lineDetails
 */
const parentArray = async (lineDetails: LineDetails) => {
  const res: LineDetails[] = [lineDetails];
  let ld = lineDetails;
  let parent: LineDetailsO = await lineDetails.parentTabLine;
  while (parent) {
    res.push(parent);
    ld = parent;
    parent = await ld.parentTabLine;
  }
  return res;
};
const displayParser = async (lineDetails: LineDetails[]) => {
  const shouldHideDetails = await Promise.all(
    lineDetails.map(async (ld) => {
      const parents = await parentArray(ld);
      return {
        hide: parents.find((p) => p.input.includes("# Style")),
        lineDetails: ld,
      };
    }),
  );

  return shouldHideDetails
    .filter((d) => !d.hide)
    .flatMap((d) => [d.lineDetails.input.replace("\n", ""), <br />]);
};

export const StyleTags = () => {
  const ref = useRef();
  useEffect(() => {
    addEventListener("paste", ref.current);
  });
  const [rend, setRend] = useState<React.ReactNode[]>([]);
  useEffect(() => {
    displayParser(parseLines(stagString)).then(setRend);
  }, []);
  return (
    <div contentEditable ref={ref}>
      {rend}
    </div>
  );
};
