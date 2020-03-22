# Notes searcher

Full-text and tag-based searching of arbitrary directories and files.
Lets you make your own zettelkasten! Inspired by https://zettelkasten.de/.

Runs in VS code as an extension.


# projects

See each project dir for detailed docs. To build the whole lot:

> ./build.all.sh

This will build a vscode extension (vsix) in this directory, which
you can install from vscode.

## vscode

VS code extension

## cli

Console app that does indexing and searching


# todo
- view
    - open doc on click
    - remove output to output channel
    - activity bar icon
    - remove expand icon from search results
- bug: quoted search only searches first word
- extract keywords & tags from current doc, show related docs
- re-index on save
- search results are _all_ clickable
- show last entered query on search
- e2e tests
