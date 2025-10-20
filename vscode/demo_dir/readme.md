# Note searcher demo directory

Open this directory with note seacher to test its features.


## full text search
Press `ctrl+alt+s` to search for files using full-text search. Some example
queries:

`cheese`
`cheese -food`
`cheese +train`


## links
Add a [link](trains.md) to your files, and vscode makes them clickable
hyperlinks. Files can be images or other non-text files, eg.
[not a note](not_a_note.bin).

You can also use wiki links, like this: [[cheese]], or [[this | trains]].

[Dead links](to/nowhere.md) are shown in the sidebar. Works for markdown and
[[wiki links | non_existent_note]].

Links to the current note are shown in the 'backlinks' section of the sidebar.


## quirks
This goto reference works fine: [[trains]]

This does not (finds 2 defs):

[[trains]]
-

VS Code is treating the above trains link as a heading, as it's got a line under
it. I don't know why VS code provides a link to the heading you've just clicked
on, but it does, and thus there's two links - the heading itself, and the note
it's referencing.
