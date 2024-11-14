import { useEffect, useRef } from "react";
import * as z from "zod";

/**
 * Out of this I still have a lot to do
 * - Write it better
 * - Have block tags on each line details
 * - Close off all the styles at the end of each block and open them again?
 */

export const stagString = `# Styles
\t.bold
\t\tfont-weight: bold;
\t.italics
\t\tfont-style: italic;
\t.heading1
\t\tfont-size: 20px;
\t\tfont-weight: bold;
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

type StagBreak = {
  styleTagName: string; // <style-bold> = bold;
  type: "open" | "close"; // <style-bold> = open;
};

type StagContent = {
  text: string;
};

type StagNode = StagBreak | StagContent;

const hashRe = /^\s*#* /;
const styleTagRe = /<\/?style-(\w*-*)*>/g;

class LineDetails {
  input: string;
  // 0 indicates normal text - 1,2,3,4, are <h1>...<h6> - denoted in app domain as # for h1, and ## for h2 at the start of a line.
  // 0 | 1 | 2 | 3 | 4 | 5 | 6;
  header: number;
  // need a style tag start stop indicator - keep a list of indices at which we need to apply or remove a class?
  stagNodes: StagNode[] = [];
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
    this.header = (hashRe.exec(input || "")?.[0]?.length || 1) - 1;
    const styleTags = [...input.matchAll(styleTagRe)];

    this.stagNodes = styleTags.flatMap((match, i, arr) => {
      const prevMatch = arr[i - 1];
      const prevMatchEndIndex = prevMatch
        ? prevMatch.index + prevMatch[0].length
        : 0;
      const res: StagNode[] = [
        { text: input.slice(prevMatchEndIndex, match.index) },
        {
          styleTagName: match[1],
          type: match[0].startsWith("</") ? "close" : "open",
        },
      ];
      return res;
    });
    const lastStyleTag = styleTags[styleTags.length - 1];
    this.stagNodes.push({
      text: input.slice(
        lastStyleTag ? lastStyleTag.index + lastStyleTag[0].length : 0,
      ),
    });
    if (this.header) {
      const styleTagName = `heading${this.header}`;
      this.stagNodes.unshift({ styleTagName, type: "open" });
      this.stagNodes.push({ styleTagName, type: "close" });
    }
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
        hide: parents.find((p) => p.input.startsWith("# Style")),
        lineDetails: ld,
      };
    }),
  );

  return shouldHideDetails.filter((d) => !d.hide).map((d) => d.lineDetails);
};

// basically have a zod validator that can ensure each param goes with it's associated values.
// all colors will be hex coded
// line-decoration: "none" |
const hexColorRe = /#[0-9a-fA-F]{6}/;
const pxRe = /\d+px/;
type StyleRe = {
  re: RegExp;
  uiFeedbackDescription: string;
};
const hexColorStyle: StyleRe = {
  re: hexColorRe,
  uiFeedbackDescription:
    "Examples of a hex pattern are #FFFFFF for white. There must be a hash tag followed by 6 characters that can be numbers or A-F",
};
const pxStyle: StyleRe = {
  re: pxRe,
  uiFeedbackDescription:
    "Pixel values must be in the form of numbers followed by px. For example 16px.",
};
// A subset of css styles

const zodRe = ({ re, uiFeedbackDescription }: StyleRe) =>
  z
    .string()
    .refine((str) => !!re.exec(str), { message: uiFeedbackDescription })
    .transform((str) => re.exec(str)[0]);

const stylesValidator = z
  .object({
    ["text-decoration"]: z.literal("none").or(z.literal("underline")),
    ["font-weight"]: z.literal("normal").or(z.literal("bold")),
    ["font-style"]: z.literal("normal").or(z.literal("italic")),
    ["background-color"]: z.literal("transparent").or(zodRe(hexColorStyle)),
    ["color"]: zodRe(hexColorStyle),
    ["font-size"]: zodRe(pxStyle),
  } as const)
  .partial();

type StagStyle = z.TypeOf<typeof stylesValidator>;

type StyleFromLines = {
  cssSelector: string;
  style: StagStyle;
};

type StyleKV = { key: string; val: string } | { error: string };

const parseStyleKv = (line: LineDetails): StyleKV => {
  const keyRe = /^\t\t((\w*-*)*)/;
  const valRe = /: ((\w*-*)*)/;
  const key = keyRe.exec(line.input)?.[1];
  const val = valRe.exec(line.input)?.[1];
  return key && val
    ? { key, val }
    : {
        error: !key
          ? "no key found"
          : !val
            ? "no val found"
            : "no key or val found",
      };
};

const isDev = true;
const devLogger = (goal: string, ...args: any[]) => {
  if (isDev) console.log(`[${goal}]`, ...args);
};

const selectorRe = /\t(\.[\w-]*)/;
// this is harrible;
const parseStyleFromLines = (lineDetails: LineDetails[]) => {
  const feedback: string[] = [];
  let selector: string | null = null;
  //
  const styleTagIndex = lineDetails.findIndex((v) =>
    v.input.startsWith("# Style"),
  );
  const endStyleIndex = lineDetails.findIndex(
    (v, i) => i > styleTagIndex && !v.input.startsWith("\t"),
  );
  devLogger("find style tag", styleTagIndex, endStyleIndex);
  const styleLines = lineDetails.slice(styleTagIndex, endStyleIndex);
  return styleLines.reduce(
    (agg, el) => {
      const isSelector = selectorRe.exec(el.input);
      devLogger("working-selectorRe", isSelector, el);
      if (isSelector) {
        selector = isSelector[1];
        return { ...agg, [selector]: {} };
      }
      if (!selector) return agg;
      const kvE = parseStyleKv(el);
      devLogger("style-kv-parse", kvE);
      if ("error" in kvE) {
        devLogger("style-kv-parse", kvE.error);
        feedback.push(`line "${el.input}" failed to parse key value pair`);
        return agg;
      }
      const isValid = stylesValidator.safeParse({ [kvE.key]: kvE.val });
      devLogger("zod-kv-parse", isValid);
      if (isValid.success) {
        devLogger("agg-result", {
          ...agg,
          [selector]: { ...agg[selector], ...isValid.data },
        });
        return { ...agg, [selector]: { ...agg[selector], ...isValid.data } };
      } else if (isValid.error) feedback.push(isValid.error.message);
      return agg;
    },
    {} as Record<string, StagStyle>,
  );
  // First 1 tab depth and a string - that's the in doc selector
  // Second 2 tab depth is key value pair - need to be parsed as per above
  // any failure should abort the process with an error message
};

const injectStyle = (
  documentSelector: string,
  style: ReturnType<typeof parseStyleFromLines>,
) => {
  const styleTag = document.createElement("style");
  document.head.appendChild(styleTag);
  const txt = Object.entries(style)
    .map(([k, v]) => {
      return `${documentSelector} ${k} {
    ${Object.entries(v)
      .map(([param, value]) => {
        return `${param}: ${value};`;
      })
      .join("\n")}\n}`;
    })
    .join("\n\n");
  styleTag.innerText = txt;
  console.log("Genned style tag", txt);
  //
};

export const StyleTags = () => {
  const ref = useRef();
  const docCLass = "ddocc";
  useEffect(() => {
    addEventListener("paste", ref.current);
  });
  useEffect(() => {
    const allLineDetails = parseLines(stagString);
    try {
      console.log("TRY TO PARSE!!");
      const style = parseStyleFromLines(allLineDetails);
      injectStyle(`.${docCLass}`, style);
      console.log("pares result", style);
    } catch (error) {
      console.error(error);
    }
    displayParser(allLineDetails).then((lineDetails) => {
      const el = ref.current as HTMLElement;
      if (el.innerHTML) return;
      const classNamesRecord: Record<string, boolean> = {};
      console.log(lineDetails);
      const stagDomNodes = lineDetails.flatMap((ld) => {
        const nodes = ld.stagNodes.flatMap((n) => {
          if ("text" in n) {
            const spanNode = document.createElement("span");
            spanNode.classList.add(
              ...Object.keys(classNamesRecord).filter(
                (k) => typeof k === "string" && classNamesRecord[k],
              ),
            );
            spanNode.innerText = n.text;
            return [spanNode];
          } else {
            classNamesRecord[n.styleTagName] = n.type === "open";
            return [];
          }
        });
        return [...nodes, document.createElement("br")];
      });
      stagDomNodes.forEach((n) => el.appendChild(n));
    });
  }, []);
  return <div contentEditable ref={ref} className={docCLass} />;
};
