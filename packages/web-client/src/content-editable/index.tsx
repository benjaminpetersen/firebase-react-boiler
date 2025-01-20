import { useState } from "react";
import { DualView } from "./DualView";

const Main = () => {
  const [v, sV] = useState(localStorage.getItem("k") || "");
  const setValue = (v: string) => {
    localStorage.setItem("k", v);
    sV(v);
  };
  return <DualView />;
};

export default Main;
