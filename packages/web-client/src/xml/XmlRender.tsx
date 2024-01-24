import { XMLBuilder } from "fast-xml-parser";
import { XmlPart, XmlTextNode, isRecognizedXmlTag, isTextNode } from "./parse";
import React from "react";
import { marked } from "marked";

export const recognizedTags = {
  bold: ({ text }: { text: string }) => <strong>{text}</strong>,
  italics: ({ text }: { text: string }) => <em>{text}</em>,
};

const preserveNewlines = (text: string): React.ReactNode[] => {
  // every text node get's parsed with a p tag by the markdown parser.
  // Only back to back newlines should get an n breaks --1 tags
  const newlineRe = /\n+/g;
  const newlines = text.match(newlineRe) || [];
  return text.split(newlineRe).flatMap((txt, i) => {
    const originalNewlines = newlines[i] || "";
    const numNewlines = originalNewlines.split("").length;
    const numBreaks = numNewlines - 1;
    const nl =
      numBreaks > 0
        ? Array.from({ length: numBreaks }).map((_, i) => (
            <br key={`${txt}-${i}`} />
          ))
        : [];
    return [txt, ...nl];
  });
};

const renderMarkdown = (markdown: string) => marked(markdown, { breaks: true });

const RenderText = ({ text, key }: { text: string; key?: string }) => {
  return (
    // preserve newlines and run through md parser.
    <React.Fragment key={key}>
      {preserveNewlines(text).map((v, i) =>
        typeof v === "string" ? (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(v) }}
          />
        ) : (
          v
        ),
      )}
    </React.Fragment>
  );
};

// oh dear god, just skip stuff.
const builder = new XMLBuilder({
  preserveOrder: true,
  textNodeName: "text",
});

export const renderXmlPart = (
  part: XmlPart | XmlTextNode,
): React.ReactNode[] | React.ReactNode => {
  // can we preserve the prev xml in the renderer?
  // how to get keys?
  if (isTextNode(part)) return <RenderText {...part} key={"aah"} />;
  const [k] = Object.keys(part);
  if (!isRecognizedXmlTag(k)) {
    console.log("Raw render", part, { v: builder.build(part) });
    return <RenderText text={builder.build(part)} key={"xml"} />;
  }
  return part[k].map((node: XmlPart | XmlTextNode) => {
    const xml = !isTextNode(node) ? node : undefined;
    if (isTextNode(node)) {
      return isRecognizedXmlTag(k) ? (
        recognizedTags[k](node)
      ) : (
        <RenderText {...node} key="xml" />
      );
    } else if (xml) return renderXmlPart(xml);
  });
};
