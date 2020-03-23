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
- activity bar icon
- bug: quoted search only searches first word
- bug: query '#word' gives same results as 'word'
- search box in results view (not supported in tree view... use webview?)
- suggest tags
- extract keywords & tags from current doc, show related docs
- list all tags
- re-index on save
- e2e tests
