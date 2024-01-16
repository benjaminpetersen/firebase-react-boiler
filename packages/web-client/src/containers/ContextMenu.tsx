import { useState } from "react";
import { ContextMenuCtx, IContextMenu } from "./contextMenu";
const { Provider } = ContextMenuCtx;
export const ContextMenuProvider = ({ children }) => {
  const state = useState<IContextMenu>();
  return (
    <Provider value={state}>
      <div>
        {children}
        <div>{state[0]?.menu}</div>
      </div>
    </Provider>
  );
};
