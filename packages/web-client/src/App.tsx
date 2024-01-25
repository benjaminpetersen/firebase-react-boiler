import React, { Suspense } from "react";
import "./App.css";
import CollaborativeEditor from "./DocsCollab";
import { ContextMenuProvider } from "./containers/ContextMenu";
import Main from "./content-editable";
import Md from "./markdown";
const TwoEditorsSameBrowser = React.lazy(
  () => import("./samples/TwoSlateEditorsSameBrowser"),
);
const TwoMdEditorsYjs = React.lazy(() => import("./samples/TwoMdEditorsYjs"));
const App = () => {
  if (Math.random()) return <TwoMdEditorsYjs />;
  if (Math.random()) return <Md />;
  if (Math.random()) return <Main />;
  if (Math.random())
    return (
      <Suspense fallback={<div>loading dev junk...</div>}>
        <TwoEditorsSameBrowser />
      </Suspense>
    );
  return (
    <ContextMenuProvider>
      <CollaborativeEditor />
    </ContextMenuProvider>
  );
};

export default App;
