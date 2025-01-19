import { QuillBinding } from "y-quill";
import * as Y from "yjs";
import Quill from "quill";
import { useEffect, useRef } from "react";

const ydoc = new Y.Doc();
const bacDoc = new Y.Doc();
const fdeDoc = new Y.Doc();
const type = ydoc.getText("quill");
const bacT = bacDoc.getText("quill");
const fdeT = fdeDoc.getText("quill");

bacT.observeDeep((events, transaction) => {
  console.log("Observe bacT", events, transaction);
  // Very helpful - events has elements of an array. if you look under:
  events[0].delta;
  // {insert | retain | delete}
  // For example - if another user appends "!" to "Hello World", the delta would be [{retain: 11}, {insert: "!"}]
  type.applyDelta(events);
});
fdeT.observeDeep((events) => {
  type.applyDelta(events);
});

export const Dev = () => {
  const ref = useRef();
  const handleCkick = () => {
    bacT.insert(0, "b");
    bacT.insert(0, "a");
    bacT.insert(2, "c");
    fdeT.insert(3, "f");
    fdeT.insert(4, "d");
    fdeT.insert(4, "e");
  };
  useEffect(() => {
    const editor = new Quill(ref.current, {
      modules: {
        toolbar: [[], [], ["image", "code-block"]],
      },
      placeholder: "Start collaborating...",
      theme: "snow", // or 'bubble'
    });
    const binding = new QuillBinding(type, editor);
  }, []);
  return (
    <div>
      <button onClick={handleCkick}>gen abcdef at start</button>
      <div ref={ref}>editor</div>;
    </div>
  );
};
