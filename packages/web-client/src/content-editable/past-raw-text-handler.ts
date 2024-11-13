// Shamelessly ChatGPT
// Add event listener for paste event
export const onPasteRawText = (event) => {
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
