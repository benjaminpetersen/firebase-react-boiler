const join = (...s: (string | undefined)[]): string =>
  s.filter(Boolean).join(" ");
export const LeafComponents = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.todo) {
    children = (
      <>
        <input checked={leaf.todo === "done"} type="checkbox" />
        {children}
      </>
    );
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};
