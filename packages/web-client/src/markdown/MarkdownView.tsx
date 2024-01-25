import { useEffect, useState } from "react";
import { ParseRes } from "../xml/parse";
import { XMLParser } from "fast-xml-parser";
import { renderXmlPart } from "../xml/XmlRender";

/**
 * Bugs
 * - Whitespace isn't preservered.
 * - Run every output through the markdown?
 * @param param0
 * @returns
 */

export const MarkdownView = ({
  markdown = "# heading1",
}: {
  markdown?: string;
}) => {
  const text = markdown;
  const [rend, setRend] = useState<ParseRes>();
  useEffect(() => {
    try {
      const parser = new XMLParser({
        preserveOrder: true,
        textNodeName: "text",
        trimValues: false,
      });
      const withPre = !text.startsWith("<main>") ? `<main>${text}` : text;
      const withPost = !text.endsWith("</main>")
        ? `${withPre}</main>`
        : withPre;
      const jObj = parser.parse(withPost);
      setRend(jObj);
    } catch (error) {
      console.error("PARSE ERR", error);
    }
  }, [text]);

  return (
    <div className="full-size">
      {rend ? rend[0].main.map(renderXmlPart) : "NO WORK"}
    </div>
  );
};
