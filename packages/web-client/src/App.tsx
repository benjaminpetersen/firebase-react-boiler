import React, { Suspense } from "react";
import "./App.css";
import CollaborativeEditor from "./DocsCollab";
import { ContextMenuProvider } from "./containers/ContextMenu";
import Main from "./content-editable";
const TwoEditorsSameBrowser = React.lazy(
  () => import("./samples/TwoEditorsSameBrowser"),
);
const App = () => {
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
