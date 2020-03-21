# Notes searcher

Full-text and tag-based searching of arbitrary directories and files.
Lets you make your own zettelkasten! Inspired by https://zettelkasten.de/.


# projects

See each project dir for detailed docs. To build the whole lot:

> ./build.all.sh

This will build a vscode extension (vsix) in this directory, which
you can install from vscode.

## cli

Console app that does indexing and searching

## vscode

VS code extension


# todo
- vscode
    - remove 'get current dir' command
    - package extension
        - bundle jar with extension *done*
    - show last entered query on search
    - message on index start/complete
    - e2e tests
    - publish extension?
