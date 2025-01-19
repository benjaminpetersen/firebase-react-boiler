// A powerful goal is to take DomNodes and map them back. I think even if browsers append or
// create new divs in different ways, as long as that translates to updating the
// NoteBackend the same and propagating the changes to all browsers the same then we're winning.

import { AppNoteSegments } from "./types";

// A second equally powerful goal is some dogma for mutating from one array to another. So you could go from NoteBackend to AppModel with 2 differnet copies and come up with a set of dom mutations to get between them?
// pretty tough as the edits I make on my page could get applied twice if I'm not careful... exclusively execute incoming changes onto the screen and map from screen to model. 2 different ops?
// how to map changes? diff match from google would give me minus and plus sections

// it really does seem a valuable intermediate requirement is simple normalization...
// or just to text and manually find all the automation parts.

const findParent = (
  el: ChildNode,
  find: (el: ChildNode) => boolean,
  stopSearch?: (el: ChildNode) => boolean,
): ChildNode | null => {
  const parent = el.parentElement;
  if (stopSearch && stopSearch(parent)) return null;
  if (parent && find(parent)) return parent;
  else if (parent) return findParent(parent, find);
  else return null;
};

const isTextNode = (ch: ChildNode): ch is Text => ch.nodeType === ch.TEXT_NODE;

const getTextNodes = (el: ChildNode) => {
  const txt: Text[] = [...el.childNodes].flatMap((ch): Text[] => {
    return isTextNode(ch) ? [ch] : "childNodes" in ch ? getTextNodes(ch) : [];
  });
  return txt;
};

/**
 * 1. Recurse to get all text nodes
 * 2. Climb the parents to find classes and reverse engineer the style tags, and every other feature as well.
 * 3. Normalization
 * @param node HTMLDivElement
 * @returns
 */
const domToSegments = (node: HTMLDivElement): AppNoteSegments => {
  // Recurse and find block nodes and spans. find the relevant classes and make the style tags
  // 1.
  const textNodes = getTextNodes(node);
  textNodes.flatMap((txt): AppNoteSegments => {
    const styleParent = findParent(
      txt,
      (el) =>
        Boolean(
          "classList" in el &&
            el.classList instanceof DOMTokenList &&
            [...el.classList].find((cl) => cl.startsWith("nt-style-")),
        ),
      (el) => el === node,
    );
    if (styleParent) {
      // will need get a full list of parents up to the root note segment
      return [
        { type: "style", openClose: "open", styleTag: "", text: "" },
        { type: "text", text: txt.textContent || "" },
        { type: "style", openClose: "close", styleTag: "", text: "" },
      ];
    } else return [{ type: "text", text: txt.textContent }];
  });
  return [];
};
