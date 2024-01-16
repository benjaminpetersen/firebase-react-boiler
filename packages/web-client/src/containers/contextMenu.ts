import { createContext, useContext, useState } from "react";

export type IContextMenu = {
  anchorNode: Node;
  offset: { x: string; y: string };
  menu: React.ReactNode;
};
export const ContextMenuCtx = createContext<
  ReturnType<typeof useState<IContextMenu | undefined>>
>([undefined, () => {}]);

export const useContextMenu = () => useContext(ContextMenuCtx);
