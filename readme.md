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
- bug: readme shows 2 links to trains
- add manual full reindex if not there already - cater for external fs changes
- manual test: test before/after. expect:
    - (much) faster indexing
    - otherwise same behaviour
- maybe: DefaultMultiIndex: merge addFile and onFileModified?
- fix later: 'links from this note' not updated on save
    - discovered during dev, existing behaviour
- fix later: extension not activated when no directory is open: provide a help
  message
- later: replace mocked/other high level tests with acceptance tests
- fix later: 'links from this note'
    - doesn't show all links, eg. demo_dir/readme links to 'not_a_note.bin'
    - shows dead links, eg delete trains, still shows link to trains
        - this is dumb, and confusing when you've moved a file (shows both)
- later: dead links should navigate to the offending link text
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
