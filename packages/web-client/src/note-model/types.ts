/**
 * This is the txt file behind all editable documents. It has the following features
 ** Markdown style header denotation: ex/ "# Title"
 ** XML Tags without the opening / closing rules. They can overlap
 *** stag - style tags - <style-bold> boldened text </style-bold>
 *** nt-links <link-anchor doc=[doc-id] anchor=[unique-hash]/> and <link doc=[doc-id] anchor=[unique-hash] open hover ...? />
 *** nt-exp: expansions - type something and hit tab to expand to some other text
 ** Special hidden header sections that . Everything following them has tab depths like yaml and affects the functionality of the document
 *** # Style: (stag) the location that has a subset of css style under a title (like bold)
 *** # Initiatives: (inis) initiatives - a regex paired with some data for a server request
 *** # Expansions: (nt-exp) type something and press tab to opt in. Ex "welc>" becomes "wecome to <tab1/> document. Here's some tips to get started: " err whatever
 */
export type NoteBackend = string;
// Perhaps if an app constraint was you exclusively remove stuff from the note backend and apply visual effects, then this task would be easier?

export class Line {
  /**
   *
   * @param text: Every block of text between every newline from NoteBackend.split("")
   */
  constructor(public readonly text: string) {}
}

export type AppNoteSegmentTypes = {
  Text: { text: string; type: "text"; hide?: boolean };
  StyleMatch: {
    styleTag: string;
    openClose: "open" | "close";
    type: "style";
    hide?: boolean;
    text: string;
  };
  // every newline? not sure yet, but for now that's what i'll do.
  BlockBoundary: { type: "block"; hide?: boolean; text: string };
  // nt-links
  // ... and more. nt-pal
};
export type AppNoteSegment = AppNoteSegmentTypes[keyof AppNoteSegmentTypes];
export type AppNoteSegments = AppNoteSegment[];
