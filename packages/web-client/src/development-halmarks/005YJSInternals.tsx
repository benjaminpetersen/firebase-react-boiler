import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";

const setWindow = (key: string, el: any) => {
  window[key] = el;
};

// The goal is to explore what 2 clients sharing data looks like and what the data model looks like. I want to know how sync
// const d = new Y.Doc();
// const type = d.get("wat", Y.Text);
// type.toDelta()
// type.insert(0, "abc");
// type.insert(1, "-1thpos-");

// LURN
// const sv = Y.encodeStateVector(d);
// const logme = Y.decodeStateVector(sv);
// console.log("LOGGER", logme);
// logs Map { clientID => clientsClock }

// const updateWIre = Y.encodeStateAsUpdate(d);
// const update = Y.decodeUpdate(updateWIre);

// A snapshot is the ids and clocks. Seems identical to the state vector to me? no info on doc content, but can be applied with a Doc to get to a previous state.

// console.log("update", update);
// {structs: _Item[], ds: DeleteSet[] }
// _Item has linked list info (parent: null, or YDoc), and origin, rightOrigin, and clock all seem to be used together to makeup the reconstruction
//// parent - Doc or probably some other AbstractType
//// origin - leftward anchor?
//// rightOrigin - rightward anchor?
//// origin and clock are used in combo probably to apply an update?

// @ts-ignore
// setWindow("upd" update;
// console.log("over wire", updateWIre);
// { 49 bytes to represent 3 sections of text} - "a", "-1thpos-", "bc". Linked list info as well in each item, and deleted
// hrm

// @ts-ignore
// window.type = type;

// My real goal here - pretty much just get OT like ops out of the "update". So insert at index, delete count at index, so I can update the DOM.
/**
 * Approach? - i guess if I could walk through the text nodes I could literally just match new lamport timestamps and update the DOM?
 */
const doc1 = new Y.Doc();
const txt1 = doc1.getText("test");
const doc2 = new Y.Doc();
const txt2 = doc2.getText("test");
txt1.observe((events) => {
  // console.log(event);
  // setWindow("ev", event);
  // txt2.applyDelta(event.delta);
  const vector = Y.encodeStateVector(doc1);
  // Y.update;
});
/**
 * If teh doc1 doc2 observe deal above fails try this:
 * const doc1 = new Y.Doc()
const doc2 = new Y.Doc()

doc1.on('update', update => {
  Y.applyUpdate(doc2, update)
})

doc2.on('update', update => {
  Y.applyUpdate(doc1, update)
})

// All changes are also applied to the other document
doc1.getArray('myarray').insert(0, ['Hello doc2, you got this?'])
doc2.getArray('myarray').get(0) // => 'Hello doc2, you got this?'
 */

const YJSInternals = () => {
  const [text2String, setText2String] = useState("");
  useEffect(() => {
    const observer = () => {
      setText2String(txt2.toString());
    };
    txt2.observe(observer);
    return () => {
      txt2.unobserve(observer);
    };
  }, []);
  return (
    <div style={{ display: "flex", flex: "flex flow row-wrap" }}>
      <div style={{ width: "50%" }}>
        <h1>Editor1</h1>
        <p>
          warn: This is just a dev playground, I'll only be adding characters
          and removing one key at a time based off 1 text node. Real world is
          more scary
        </p>
        <div
          contentEditable
          onKeyUp={(ev) => {
            console.log("KEY", ev.key);
            const sel = window.getSelection();
            if (ev.key === "Backspace") {
              txt1.delete(sel.anchorOffset, 1);
            } else if (ev.key.length === 1) {
              txt1.insert(sel.anchorOffset, ev.key);
            }
          }}
        ></div>
      </div>
      <div style={{ width: "50%" }}>
        <h1>Editor2 - simulated network recipient</h1>
        <div>{text2String}</div>
      </div>
    </div>
  );
};

export default YJSInternals;
