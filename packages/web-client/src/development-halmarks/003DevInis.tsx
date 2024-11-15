import { useEffect, useRef, useState } from "react";

import * as z from "zod";

const testString = `# Style
\t.bold:
\t\tfont-weight: bold;
# Initiatives
\t Send Text
\t\tregex: /!sms (\\d{10})/
\t\tcall: HTTP POST http://localhost:3001/test
\t\tbody:
\t\t\tphoneNumber: "$1"
\t\t\tkeywatever2: "could be constant strings"
\t\tdescription: "GACK"
\t\texample: "!sms 5555555555"
\t\tsomekinda-ai-prompting-helpers: "send text","notify users...","ect?"
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

const textToLineData = (text: string) => ({
  text,
  header: headerCount(text),
  tabs: tabCount(text),
});

// i changed ma mind again.
// looks like the nices api would be a lines class that has associated methods
// a search to find the next something, and a way to continue that search and return an array of results until some condition to cancel the search is met.
type Direction = "forward" | "backward";
type Some<T> = { type: "some"; data: T };
type None = { type: "none" };
type Option<T> = Some<T> | None;
const isSome = <T,>(o: Option<T>): o is Some<T> => o.type === "some";
const none = { type: "none" } as const;
const some = <T,>(t: T) => ({ type: "some", data: t }) as const;
const directionalFind =
  <T,>(array: T[]) =>
  ({
    direction,
    find,
    shouldTerminateSearch,
  }: {
    direction: Direction;
    find: (element: T, original: T) => boolean;
    shouldTerminateSearch?: (element: T, original: T) => boolean;
  }) =>
  (startIndex: number, originalStartIndex?: number): Option<[T, number]> => {
    // TODO BAD _ REDO - just adding this b/c findAll calls it recursively... definitely seems like it's findAlls responsiblity to generate the terminate function er something.
    const original =
      array[originalStartIndex !== undefined ? originalStartIndex : startIndex];
    for (
      let i = direction === "backward" ? startIndex - 1 : startIndex + 1;
      direction === "backward" ? i >= 0 : i < array.length;
      direction === "backward" ? i-- : i++
    ) {
      const el = array[i];
      if (shouldTerminateSearch && shouldTerminateSearch(el, original))
        return none;
      if (find(el, original)) return some([el, i]);
    }
    return none;
  };

const findAll =
  <T,>(find: ReturnType<ReturnType<typeof directionalFind<T>>>) =>
  (startIndex: number, originalStart?: number): T[] => {
    const original = originalStart === undefined ? startIndex : originalStart;
    const m = find(startIndex, original);
    return isSome(m) ? [m.data[0], ...findAll(find)(m.data[1], original)] : [];
  };

class Line {
  tabs: number;
  header: number;
  hide?: boolean;
  constructor(public text: string) {
    const { tabs, header } = textToLineData(text);
    this.tabs = tabs;
    this.header = header;
  }

  render(el: HTMLElement) {
    if (this.hide) return;
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(this.text));
    el.appendChild(div);
  }
}

const inisCallValidator = z.object({
  type: z.literal("HTTP"),
  method: z.literal("POST"),
  url: z.string().url(),
  body: z.record(z.string()),
}); // could be anything - like include palette commands here.

type InisCall = z.TypeOf<typeof inisCallValidator>;

type Inis = {
  regex: RegExp;
  call: InisCall;
};

const isFullInis = (v: Inis | Partial<Inis>): v is Inis =>
  "regex" in v && v.regex && "call" in v && !!v.call;

const devLogger = (pre: string, ...args: any[]) => {
  console.log(`[${pre}]: `, ...args);
};

const parseInis = (inisLines: Line[]) => {
  type Agg = {
    inis: Inis[];
    // buildingInis?: Partial<Inis>;
    buildingRegex?: RegExp;
    buildingCall?: Partial<InisCall>;
    // not sure what to do here - how to cleverly handle mixing and matching the shillyshtuff.
    buildingBody?: Record<string, string>;
    headerStack: string[];
  };
  const d: Agg = { inis: [], headerStack: [] };
  return inisLines.reduce<Agg>((agg, line) => {
    // header stack
    while (line.tabs < agg.headerStack.length) {
      agg.headerStack.pop();
      // for each thing popped there should be a cleanup or committing step for it's data...
      // def need a better data model
      // this way we culd skip the isNewInis check below where we commit and cleanup
    }
    agg.headerStack[line.tabs] = line.text;

    const isNewInis = line.tabs === 1;
    if (isNewInis) {
      const inis: Partial<Inis> = {
        call: { ...agg.buildingCall, body: agg.buildingBody },
        regex: agg.buildingRegex,
      };
      delete agg.buildingBody;
      delete agg.buildingCall;
      delete agg.buildingRegex;
      // validate
      if (inis && isFullInis(inis)) agg.inis.push(inis);
    }
    const lastHeader = agg.headerStack[agg.headerStack.length - 1];
    const s = agg.headerStack;
    const buildMode = s[2]?.startsWith("\t\tregex:")
      ? "regex"
      : s[2]?.startsWith("\t\tbody:") && !line.text.startsWith("\t\tbody:")
        ? "body"
        : s[2]?.startsWith("\t\tcall:")
          ? "call"
          : "unknown";
    switch (buildMode) {
      case "unknown":
        break;
      case "body": {
        const kvRe = /([a-zA-Z\-0-9]*):(.*)/;
        const m = kvRe.exec(line.text);
        const k = m?.[1];
        const v = m?.[2];
        devLogger("body parse", k, v);
        if (k) agg.buildingBody = { ...agg.buildingBody, [k]: v };
        break;
      }
      case "regex": {
        const kvRe = /([a-zA-Z\-0-9]*):(.*)/;
        const v = kvRe.exec(line.text)?.[2];
        const leadSlash = /^\//;
        const followingSlash = /\/$/;
        const preRe = v.trim();
        const re =
          leadSlash.exec(preRe) && followingSlash.exec(preRe)
            ? new RegExp(
                preRe.replace(leadSlash, "").replace(followingSlash, ""),
              )
            : undefined;
        agg.buildingRegex = re;
        break;
      }
      case "call": {
        const kvRe = /([a-zA-Z\-0-9]*):(.*)/;
        const v = kvRe.exec(line.text)?.[2];
        devLogger("call block", v, line.text);
        if (v) {
          const spreadable = (
            k: string,
            v?: string,
            shouldSpread: boolean = true,
          ) => (typeof v === "string" && shouldSpread ? { [k]: v } : {});
          const [type, method, urlString] = v.trim().split(" ");
          const methodRe = /(POST)/;
          const typeRe = /(HTTP)/;
          const parseUrl = (u?: string) => {
            const allowedHostnames = ["localhost", "wwww.someserver.com"];
            try {
              const url = new URL(u);
              if (allowedHostnames.includes(url.hostname))
                return url.toString();
              else {
                console.warn(
                  "URL not in allowed host names. Got: " +
                    urlString +
                    " Expected: " +
                    allowedHostnames,
                );
                return undefined;
              }
            } catch (error) {
              console.warn(
                "Failed to get a proper url from the Initiatives section",
                urlString,
              );
            }
            return undefined;
          };
          const url = parseUrl(urlString);
          //   const u =
          agg.buildingCall = {
            ...agg.buildingCall,
            ...spreadable("url", url),
            ...spreadable("method", method, !!methodRe.exec(method)),
            ...spreadable("type", type, !!typeRe.exec(type)),
          };
          devLogger("call parse", { url, method, type });
        }
        // TODO, use some official url parser and have a safe set of domains - which would be wherever this is hosted and localhost
        // meeeeeeh - use kv parser and then take everything after the colon and split on spaces, then validate....
        break;
      }
      default:
        break;
    }
    return agg;
  }, d).inis;
};

const findInisMatch = (inis: Inis, el: HTMLElement) => {
  const m = inis.regex.exec(el.innerText);
  if (m) {
    return { inis, match: m };
  }
};

const hide = (l: Line) => (l.hide = true);

export const Comp = () => {
  const ref = useRef();
  const [inis, setInis] = useState<ReturnType<typeof findInisMatch>[]>([]);
  useEffect(() => {
    const el = ref.current as HTMLElement;
    if (!el) return;
    // goals, hide style and hide iter and it's children
    const lines = testString.split("\n").map((l) => new Line(l));
    const finder = directionalFind(lines);
    const findChild = finder({
      direction: "forward",
      find: (l, o) => l.tabs > o.tabs,
      shouldTerminateSearch: (l, o) => l.tabs === o.tabs,
    });
    const findChildren = findAll(findChild);
    const styleStart = lines.findIndex((l) => l.text.startsWith("# Style"));
    const styleLines = findChildren(styleStart);
    const inisStart = lines.findIndex((l) =>
      l.text.startsWith("# Initiatives"),
    );
    const inisLines = findChildren(inisStart);
    const inisParse = parseInis(inisLines);
    setInis(inisParse.map((inis) => findInisMatch(inis, el)));
    console.log(inisParse);
    [lines[inisStart], ...inisLines, ...styleLines, lines[styleStart]].forEach(
      hide,
    );
    el.innerHTML = "";
    lines.forEach((line) => {
      line.render(el);
    });
  }, []);
  return (
    <>
      <div contentEditable ref={ref}>
        some start
      </div>
      <div>
        actions render:
        <br />
        {inis.map((i) => (
          <div>Match: {i.match?.[0] || "no matched text?"}</div>
        ))}
      </div>
    </>
  );
};
