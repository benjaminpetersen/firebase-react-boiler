import type { ITextExpansion } from "../expansions";

export const ExpansionsContextMenu = ({
  expansions,
  onSelect,
}: {
  onSelect: (expansion: ITextExpansion) => void;
  expansions: ITextExpansion[];
}) => {
  return (
    <div className="expansions-context-menu">
      {expansions.map((expansion) => (
        <div
          onClick={() => {
            onSelect(expansion);
          }}
        >
          ** {expansion.value} **
        </div>
      ))}
    </div>
  );
};
