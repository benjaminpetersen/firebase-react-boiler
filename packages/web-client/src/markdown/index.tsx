import { useState } from "react";
import { MarkdownView } from "./MarkdownView";
import { MarkdownEditor } from "./MarkdownEditor";

const Main = ({
  value: v,
  setValue,
}: {
  value: string;
  setValue: (s: string) => void;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "row no-wrap",
        justifyContent: "space-evenly",
      }}
      className="full-size"
    >
      <MarkdownEditor markdown={v} setMarkdown={setValue} />
      <MarkdownView markdown={v} />
    </div>
  );
};

export default Main;
