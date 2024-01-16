import "./App.css";
import CollaborativeEditor from "./DocsCollab";
import { ContextMenuProvider } from "./containers/ContextMenu";

const App = () => {
  return (
    <ContextMenuProvider>
      <CollaborativeEditor />
    </ContextMenuProvider>
  );
};

export default App;
