import * as Y from "yjs";

const ydoc = new Y.Doc();
const type = ydoc.getText("editor");
const starterText = `Hello, edits here should show up below. the word i-nvisible is not visible. it's here: "invisible" and the asterisk should make things *bold*`;

// these will be broken up to be important rendering bits. i guess they need to split themselves as well if an asterisk is added, or invisible is somehow made by deleting a char...
// Very important to keep rendering in several steps
// 1. Raw edits to node contents
// 2. was gonna say parse new break points? if we see an asterisk everything is boldened until the next one here... but it's tough with edits that might span over to new text nodes inv*sble for example. that would be 2 nodes and a post process step only works if it checks the whole thing. I really want to go back to vdom approach, or at least something a bit more manageable...
// 3. Recalculate the influencing start stop nodes and propagate changes over the other nodes it impacts? BLECH

// again we can't do VDOM because we may delete the node the user is on when we shouldn't... need a way to preserve the knowledge of where the char "a" is added to "aaaaaa"
// but only if i'm currently selecting it... otherwise it's just display that matters?
// we could just completely mutate the selection with the exact same OT logic everything is going to get shifted by.
// So on network changes grab the selection and just move its start and stop points according to the mutations? then render however you want?
// And a killer performance benefit would just be running this VDOM code on a slice of text.

type Segment = {
  text: string;
  hidden?: boolean;
  style?: string;
  openClose?: "open" | "close";
};

const makeSegments = (txt: string): Segment[] => {
  // txt
  return [];
};

const s = { style: { width: "33%" } };
export const Dev = () => {
  return (
    <div style={{ display: "flex", flex: "flow row wrap" }}>
      <div contentEditable {...s}>
        {starterText}
      </div>
      <div {...s}></div>
      <div {...s}></div>
    </div>
  );
};
