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
- detect dead links & show as error
    - abs links still don't quite work: use my dir as example
    - support relative links
    - add user configuration: it's really annoying!
        - off by default, until I find out a better way
- make docs clear that this thing currently sucks :)
    - "under construction" message at top
    - mark as preview/prerelease
- don't show dead links as error
- quick enable/disable indexing
- show dead links while editing
- link autocomplete
- moving indexing progress to status bar
- separate view for search results + related files etc.
    - I want to see file tree at same time
- show view container on search complete
- suggest tags
- bug: search before index breaks - re-index if there's an index problem
- bug: '+' operator not working as expected:
    - search for #work: no results
    - search for book: many results
    - search for +#work book:
        - expected: no results
        - actual:   many results
- search box in results view. not supported in tree view
