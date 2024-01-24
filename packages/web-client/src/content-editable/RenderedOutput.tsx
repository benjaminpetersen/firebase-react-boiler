import React, { useEffect, useState } from "react";
import { XMLParser } from "fast-xml-parser";

const recognizedTags = {
  bold: ({ text }: { text: string }) => <strong>{text}</strong>,
  italics: ({ text }: { text: string }) => <em>{text}</em>,
};

type XmlTags = keyof typeof recognizedTags;
const isRecognizedTag = (s: string): s is XmlTags => s in recognizedTags;

type TextNode = { text: string };
type XmlPart<K extends string = XmlTags> = {
  [K1 in K]: (XmlPart | TextNode)[];
};

const isText = (x: XmlPart | TextNode): x is TextNode => "text" in x;
type ParseRes = [
  {
    main: XmlPart[];
  },
];

const renderPart = (
  part: XmlPart | TextNode,
): React.ReactNode[] | React.ReactNode => {
  if (isText(part)) return <>{part.text}</>;
  const [k] = Object.keys(part);
  return part[k].map((node: XmlPart | TextNode) => {
    const xml = !isText(node) ? node : undefined;
    console.log("K", k, part, isText(part));
    if (isText(node)) {
      return isRecognizedTag(k) ? recognizedTags[k](node) : <>{node.text}</>;
    } else if (xml) return renderPart(xml);
  });
};
// >main>tag>[0]>text
export const RenderedOutput = ({ text }: { text: string }) => {
  // Keep the old parse value.. for some reason outside of the tags we lose the text node
  const [rend, setRend] = useState<ParseRes>();
  useEffect(() => {
    try {
      const parser = new XMLParser({
        preserveOrder: true,
        textNodeName: "text",
      });
      const withPre = !text.startsWith("<main>") ? `<main>${text}` : text;
      const withPost = !text.endsWith("</main>")
        ? `${withPre}</main>`
        : withPre;
      const jObj = parser.parse(withPost);
      // array?
      setRend(jObj);
      console.log("PARSE RES", jObj);
    } catch (error) {
      console.error("PARSE ERR", error);
    }
  }, [text]);
  return (
    <div className="border full-size">
      {rend ? rend[0].main.map(renderPart) : text}
    </div>
  );
};
