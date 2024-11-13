import { Suspense } from "react";
import "./App.css";
import { StyleTags } from "./development-halmarks/002DevStyleTags";

const App = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <StyleTags />
    </Suspense>
  );
};

export default App;
