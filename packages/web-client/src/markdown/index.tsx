import { useState } from "react";
import { MarkdownView } from "./MarkdownView";
import { MarkdownEditor } from "./MarkdownEditor";

const Main = () => {
  const [v, sV] = useState(localStorage.getItem("md") || "");
  const setValue = (v: string) => {
    localStorage.setItem("md", v);
    sV(v);
  };
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
