# Note searcher demo directory

Open this directory with note seacher to test its features.


## full text search

Press `ctrl+alt+s` to search for files using full-text search. Some example
queries:

`cheese`
`cheese -food`
`cheese +train`


## tags

You can also put tags anywhere in your files, #weapons or #public-speaking.
These are also searchable:

`cheese +#transport`

All tags used across all notes are shown in the sidebar.


## links

Add a [link](trains.md) to your files, and vscode makes them clickable
hyperlinks. Files can be images or other non-text files, eg.
[not a note](not_a_note.bin).

You can also use wiki links, like this: [[cheese]], or [[this | cheese]].

[Dead links](to/nowhere.md) are shown in the sidebar. Works for markdown and
[[wiki links | non_existent_note]].

Links to the current note are shown in the 'backlinks' section of the sidebar.


## ignored directories

Files in ignored directories are not indexed. Links to ignored files are dead
links, eg. [[this | ignored_file]]. Note that node_modules directories are
ignored by default, so [[this | about_node_modules]] is also a dead link.
