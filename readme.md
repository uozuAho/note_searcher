# Notes searcher

VS code extension for managing a collection of local text files, eg. a
[zettelkasten](https://zettelkasten.de/posts/overview/).

Features:
- full text search
- search by tags
- shortcuts for creating and linking notes

See the [extension marketplace](https://marketplace.visualstudio.com/items?itemName=uozuaho.note-searcher) for more details.


# Contributing

## Requirements

- nodejs


## Run tests

```sh
cd vscode
npm install
npm test
```


## Run the extension locally

Open the vscode directory with VS code, and run the `Run Extension`
configuration.


## Build the extension locally

Run `npm run build_vsix` in the vscode directory.


# WIP todo
## plan
- full text search
    - rename noteSearcher.index to noteSearcher.indexAll
    - rename/add multiIndex.index -> onFileModified
    - rename lunrFullTextSearch.test
    - inline todos
    - do i need an onNewFileSaved method?
- link index: handle file modified
- tag index: handle file modified
- handle file moved/deleted
    - full text search
    - link index
    - tag index
## code notes before start: on save
- noteSearcher.notifyNoteSaved
    noteSearcher.index();
        noteSearcher.multiIndex.index(folder);
            DefaultMultiIndex.indexAllFiles
                _tags.clear();
                _linkIndex.clear();
                _lunrSearch.reset();
                for all files
                    DefaultMultiIndex.indexFile
                        index links
                        index tags
                        lunr.index
    noteSearcher.showDeadLinks();
    noteSearcher.showTags();
- noteSearcher.notifyExtensionActivated
    noteSearcher.index();
    noteSearcher.showTags();
    noteSearcher.showDeadLinks();
# todo
- feature: make paths queryable. Eg. i want to exclude ABC from path, but not contents
- feature(s): pasting links
    - try this: https://stackoverflow.com/questions/44598894/in-a-vs-code-extension-how-can-i-be-notified-when-the-user-cuts-copies-or-paste
    - if no selected text: set cursor inside []
    - if text selected: use selected text as description. eg. 'this' becomes [this]()
- docs
    - get readme working in extension preview in vscode
    - make screenshot show in extension preview
    - prevent github link replacement in example file links
- better icon
- break up noteSearcher.ts?
    - test file is unwieldy
- feature: suggest tags in search
    - not yet available: https://github.com/microsoft/vscode/issues/35785
- feature: extract text to new note
