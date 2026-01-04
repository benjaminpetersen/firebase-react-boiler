import { Suspense } from "react";
import "./App.css";
import { Dev } from "./development-halmarks/007EditorPreNetworkPlugins";

const App = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Dev />
    </Suspense>
  );
};

export default App;
