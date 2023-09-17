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
- link index: handle file modified
    - DONE: remove a link, test links from/to
    - DONE: add a link, test links from/to
    - DONE: remove dead link, test dead links
    - DONE: add dead link, test dead links
    - DONE: remove indexAll from onsave
        - DONE: open/close folders: handled for free as extensions are restarted
            - if folder not opened, then opened, ensure folder is indexed on open
            - if another folder is opened, the static index is rebuilt
            - if a folder is closed, clear the index
        - NOTE: what is existing behaviour on:
            - open a file (not a dir): no action from note searcher
            - save a file, with no dir opened
                - each index attempts results in a message saying open a folder
        - DONE: change multiindex onFileModified signature to (path, text)
    - ignored paths:
        - on saving an ignored file, ensure it is not indexed
- inline todos
- maybe: DefaultMultiIndex: merge addFile and onFileModified?
- tag index: handle file modified
- manual test
- handle file moved/deleted
    - full text search
    - link index
    - tag index
- manual test: test before/after. expect:
    - (much) faster indexing
    - otherwise same behaviour
- fix later: 'links from this note' not updated on save
    - discovered during dev, existing behaviour
## code notes: from before my indexing changes
### on save
- noteSearcher.notifyNoteSaved
    noteSearcher.index();  # index whole dir
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
### on activate
- noteSearcher.notifyExtensionActivated
    noteSearcher.index();
    noteSearcher.showDeadLinks();
    noteSearcher.showTags();
### if not in a workspace (no dir open)
- show error in ui
### ignored files
- on indexing, FileSystem.allFilesUnderPath loads config file and ignores
  patterns
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
