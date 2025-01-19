# Introduction

## Data Model:

### Format:

The data model consists of 3 parts that map from 1-2, 2-3.

    1. ntRawFile: Each document consists of an ntRawFile, which is simple text file that includes pseudo xml. It's pseudo because the opening and closing tags can overlap one another. YJS will store edits to this.
    2. ntObjectModel: The ntRawFile then gets mapped into the ntObjectModel, which has ntTextNodes interspersed with objects that represent the xml tags. Things like bold open, bold close, picture list.
    3. HTML: DOM specific decisions will need to be made

### Editing:

All user edits happen from the DOM form. Presumeably edits will be: 1. Inserts 2. Deletes 3. Enclosures (wrapping something in a new tag) 4. De-enclosures (removing a tag)

I think in order to simplify there will be a step following edits called normalization - where we delete any empty tags that have no effect if they're empty.

This gives us the opportunity to insert and delete and really only worry about text nodes. The mapping should be quite simple

3 and 4 are much more complicated: 3. Enclosures - If the tag is open, omit the open tag, scan for the close tag, delete it,

## Domain Modelling

### Introduction

Sort of a feature list with in app names and descriptions for development. These words will show up in code alot, it's important to keep the words short, quickly recognizable, and distinct from other business words and coding concepts/words.

nt - the app shorthand. Short for note taker. Use in place of a company name because those change.

### Feature list

1. inis (short for initiatives) - simple regex in a document that populate a list of actions on the side. You could write remind me in 10 minutes, and it would trigger a button that requires confirmation before setting a reminder. I think there'll be a limit for a match of 100 chars either side of changes. and only scan on change?
2. rs (short for Rollback Stack) - a history of all changes made and annotations of which user made them
3. stag - short for style tags - I think will be xml look alikes that will always say <style-someclassname></style-someclassname>, without the closing rules, just applies the css class related to the styles from start tag to close tag - users don't actually edit the tags and backspace must skip over this, copy paste must include this. arrows must skip over.... I guess I'll just attack it at the clipboard level, literally for all other reasons it should be hidden to the user.
4. pal - global command palette that will trigger on typing stuff. Like "new document" will prompt a tab command that will modify your text (by default erasing it) and achieve some app command, ideally it will eventually also include some ai suggestions ect.
5. nt-template - a file folder structure where adding a new file will use whatever is in the same level of the same folder with the name template
6. nt-link - can be used in the headers to inherit all the good vibes from other documents. Can be hovered over to open a little popup to edit another document. Links to a specific part will create an <nt-link/anchor doc-name doc-id #globally-unique-hash /> tag. I kind of wish it wasn't like this and I could just keep track of it outside the doc but this is defos easier to implement.
7. nt-exp - expansions: sometext> prompts the user to allow the following text to expand "Some longer more thorough text with tab groups"
8. Teams - can be invited with their mention
9. nt-invites - # Invites: emails, phones, names, teams... has editors and viewers.

Development priority:

1. inis -> could start on this asap!
2. rs -> blocked by yjs deep dive
3. stag -> explored -> to lib
4. pal -> blocked by folder structure
5. nt-template -> blocked by folder structure
6. nt-link -> blocked by folder structure
