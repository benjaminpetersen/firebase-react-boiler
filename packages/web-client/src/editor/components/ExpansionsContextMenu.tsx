import { useEffect } from "react";
import type { ITextExpansion } from "../expansions";

export const ExpansionsContextMenu = ({
  expansions,
  onSelect,
}: {
  onSelect: (expansion: ITextExpansion) => void;
  expansions: ITextExpansion[];
}) => {
  useEffect(() => {
    const listener = (ev) => {
      if (ev.key === "Tab") {
        ev.preventDefault();
        const [expansion] = expansions;
        expansion && onSelect(expansion);
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [expansions, onSelect]);

  return (
    <div className="expansions-context-menu">
      {expansions.map((expansion) => (
        <div
          onClick={() => {
            onSelect(expansion);
          }}
        >
          <span className="tag">{expansion.tag}</span>
          {expansion.prompt && (
            <span className="ghost">{expansion.prompt}</span>
          )}
        </div>
      ))}
    </div>
  );
};
