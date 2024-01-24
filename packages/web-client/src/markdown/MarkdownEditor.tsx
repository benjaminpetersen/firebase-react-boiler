export const MarkdownEditor = ({
  markdown,
  setMarkdown,
}: {
  markdown: string;
  setMarkdown: (m: string) => void;
}) => {
  return (
    <textarea
      className="full-size"
      value={markdown}
      onChange={(e) => {
        setMarkdown(e.target.value || "");
      }}
    />
  );
};
