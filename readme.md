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
- show view container on search complete
- moving indexing progress to status bar
- dead links: don't show as error
    - then document the feature
- docs
    - get readme working in extension preview in vscode
    - make screenshot show in extension preview
    - prevent github link replacement in example file links
- separate view for search results + related files etc.
    - I want to see file tree at same time
    - search box in results view. not supported in tree view
- e2e tests
    - see https://developers.redhat.com/blog/2019/11/18/new-tools-for-automating-end-to-end-tests-for-vs-code-extensions/
- show incoming/outgoing links
- dead links: strip root path when showing dead links
- highlight dead links while editing
- link autocomplete or copy/paste
- suggest tags
- bug: search before index breaks - re-index if there's an index problem
- bug: '+' operator not working as expected:
    - search for #work: no results
    - search for book: many results
    - search for +#work book:
        - expected: no results
        - actual:   many results
