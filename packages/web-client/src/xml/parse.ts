import { recognizedTags } from "./XmlRender";

type XmlTags = keyof typeof recognizedTags;
export const isRecognizedXmlTag = (s: string): s is XmlTags =>
  s in recognizedTags;
export type XmlTextNode = { text: string };
export type XmlPart<K extends string = XmlTags | "main"> = {
  [K1 in K]: (XmlPart | XmlTextNode)[];
};

export const isTextNode = (x: XmlPart | XmlTextNode): x is XmlTextNode =>
  "text" in x;
export type ParseRes = [
  {
    main: XmlPart[];
  },
];
