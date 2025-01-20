import { Suspense } from "react";
import "./App.css";

const App = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <>lsss goo</>
    </Suspense>
  );
};

export default App;
