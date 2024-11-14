import { Suspense } from "react";
import "./App.css";
import { Comp } from "./development-halmarks/003DevInis";

const App = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Comp />
    </Suspense>
  );
};

export default App;
