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
- bug: query '#word' gives same results as 'word'
- auto-index
    - on save
    - on open
- suggest tags
- show view container on search complete
- search box in results view (not supported in tree view... use webview?)
- extract keywords & tags from current doc, show related docs
- list all tags
- e2e tests
    - index and search using cli
    - blocked for vscode extension: how to open folder before running tests?
        - see extension tests for attempt