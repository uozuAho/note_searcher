# Notes searcher

Full-text and tag-based searching of arbitrary directories and files.
Lets you make your own zettelkasten! Inspired by https://zettelkasten.de/.


# projects

## cli

Console app that does indexing and searching

## vscode

VS code extension

Packaging the extension is a pain, see
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

Maybe this will just work:

> vsce package

# todo
- vscode
    - package extension
        - bundle jar with extension *done*
        - make bundled jar usable during dev and by installed extension
    - show last entered query on search
    - message on index start/complete
    - publish extension?
