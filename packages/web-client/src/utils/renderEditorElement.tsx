import { CodeElement, DefaultElement } from "../editor-components";

export const renderElement = (props: any) => {
  console.log("REND", props);
  switch (props.element.type) {
    case "code":
      return <CodeElement {...props} />;
    default:
      return <DefaultElement {...props} />;
  }
};
