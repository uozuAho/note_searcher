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
- publish script/process
    - test all
    - build all
    - bump version
    - package
    - install package locally + test
    - tag
    - vsce publish
- show view container on search complete
- suggest tags
- bug: search before index breaks - re-index if there's an index problem
- bug: '+' operator not working as expected:
    - search for #work: no results
    - search for book: many results
    - search for +#work book:
        - expected: no results
        - actual:   many results
- search box in results view (not supported in tree view... use webview?)
