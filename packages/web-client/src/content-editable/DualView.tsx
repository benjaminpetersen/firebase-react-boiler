import { ContentEditableEditor } from "./ContentEditableEditor";
import { PlainView } from "./PlainView";

export const DualView = () => {
  return (
    <div>
      <ContentEditableEditor />
      <PlainView
        value={"Plainview editor todo add change handler to CEE?"}
        onChange={() => {}}
      />
    </div>
  );
};
