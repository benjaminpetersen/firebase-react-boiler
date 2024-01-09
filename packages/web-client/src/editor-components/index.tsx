export const CodeElement = (props: any) => {
  return <div {...props.attributes}>{props.children}</div>;
};
export const DefaultElement = (props) => (
  <p {...props.attributes}>{props.children}</p>
);
