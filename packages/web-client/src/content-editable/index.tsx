import { useState } from "react";
import { PlainView } from "./PlainView";
import { RenderedOutput } from "./RenderedOutput";

const Main = () => {
  const [v, sV] = useState(localStorage.getItem("k") || "");
  const setValue = (v: string) => {
    localStorage.setItem("k", v);
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
      <PlainView value={v} onChange={(_, v) => setValue(v)} />
      <RenderedOutput text={v} />
    </div>
  );
};

export default Main;
