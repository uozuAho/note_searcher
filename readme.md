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
- show related docs to current doc
    - exclude current doc
- extract tags from current doc, show related docs
- bug: ext does not activate on open note searcher
    - workaround: do a search or index to activate
- auto-index
    - on save file
    - on open directory
- refactor:
    - vscode facade
    - extension class that uses vscode facade
    - now write tests!
- show related docs on changing active doc?
    - this will obstruct browsing docs related to
      the original doc, maybe don't implement this
    - see onDidChangeActiveTextEditor
- suggest tags
- show view container on search complete
- search box in results view (not supported in tree view... use webview?)
- e2e tests
    - blocked for vscode extension: how to open folder before running tests?
        - see extension tests for attempt
