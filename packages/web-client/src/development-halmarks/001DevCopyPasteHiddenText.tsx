import { useEffect } from "react";
// Shamelessly ChatGPT
// Add event listener for paste event
const onPasteRawText = (event) => {
  console.log("CUSTOM HANDLER");
  event.preventDefault(); // Prevent the default paste action

  // Get the plain text from the clipboard
  const plainText = event.clipboardData.getData("text/plain");

  // Get the current selection and create a range
  const selection = window.getSelection();
  const range = selection.getRangeAt(0); // Get the first range (the current cursor position)

  // Delete any content that is currently selected
  range.deleteContents();

  // Create a new text node with the plain text
  const textNode = document.createTextNode(plainText);

  // Insert the plain text node at the current cursor position
  range.insertNode(textNode);

  // Move the cursor to the end of the inserted text
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);

  // Update the selection to the new position (after the inserted text)
  selection.removeAllRanges();
  selection.addRange(range);
};

export const MinimalEditor = () => {
  useEffect(() => {
    addEventListener("paste", onPasteRawText);
    return () => {
      removeEventListener("past", onPasteRawText);
    };
    // addEventListener("paste", (event) => {});
    // navigator.clipboard.addEventListener("paste", (ev) => {});
  }, []);
  return (
    <div contentEditable className="testeffect">
      <ul>
        <li>simple</li>
        <li>two simple</li>
      </ul>
      br
      <br />a break br
      <br /> features:{" "}
      <ul>
        <li>bullets, todo, images, video, bue, num, letters, links</li>
      </ul>
      wellllllll the users don't have to see the raw stuff! No sense in using
      markdown, best to use a format that's very easy to read with explicit line
      breaks and [video](somevideo.com) TNTVideoWidget1.0 autoplay w50 what i do
      like is representing everything on screen with raw text in a way the
      influences the app so users can copy and paste / inject magic into the app
      SO what if we did continue using the regex standard and somehow keep the
      magic widgets out of the doc flow? Fun to experiment
      <img
        src="https://media.istockphoto.com/id/583809524/photo/alberta-wilderness-near-banff.jpg?s=2048x2048&w=is&k=20&c=W2WIEh64AZfOEd7TuMzWQUVIBWXiHpytdWHDNEKxhPo="
        style={{ display: "inline", width: "50%" }}
      />
      PRODUCT OF CP PST = no img anything or newlines around it at all either
      I'd love to get a magic text block outside of the text area MagicMeAway to
      produce GACKAROO, it should appear inline and take the height of the max
      of either the text or widget... always have newlines be explicit? BEFORE
      MMA{" "}
      <span id="MagicMeAway" style={{ display: "none" }}>
        MagicMeAway
      </span>{" "}
      AFTER MMA
      <br />
      RESULT - doesn't cp paste <br />
      WORKING MAGIC ME AWAY NODE WRAP!
      <span
        style={{
          width: 1,
          overflow: "hidden",
          display: "inline-block",
          height: 1,
        }}
      >
        MagicMeAway
      </span>
      AFTER MMA RESULT - it does copy but preserves bs.
    </div>
  );
};

//
