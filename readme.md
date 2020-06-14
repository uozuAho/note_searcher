# Notes searcher

VS code extension for managing a [zettelkasten](https://zettelkasten.de/posts/overview/).

Features:
- full text search
- search by tags
- shortcuts for creating and linking notes

See the [extension marketplace](https://marketplace.visualstudio.com/items?itemName=uozuaho.note-searcher) for more details.


# Contributing

## Requirements

- nodejs
- java 11+


## Run tests

```sh
cd cli
./gradlew test
cd ..
cd vscode
npm install
npm test
npm run e2e:setup
./run_e2e.sh
```

e2e tests use https://github.com/redhat-developer/vscode-extension-tester


## Run the extension locally

Open the vscode directory with VS code, and run the `Run Extension`
configuration.


## Build the extension locally

Run `npm run build_vsix` in the vscode directory.


# todo
- fix dead link e2e fail on ubuntu
- docs: add better subtitle than 'searches notes' in marketplace text
- show incoming/outgoing links
    - bring link indexing into indexer
- feature: configurable new note directory
    - if not set, use current behaviour
    - set in dotfile???
- feature: ## tags for structure notes
- feature: copy link from file explorer
- break up noteSearcher.ts?
    - test file is unwieldy
- feature: suggest tags in search
    - not yet available: https://github.com/microsoft/vscode/issues/35785
- feature: paste image in clipboard as file + markdown link
- feature: extract text to new note
- feature: show recent notes
- feature: show random notes
- improve: don't index if already indexing, eg. saving multiple files
- show view container on search complete, even if no search results
- remove lucene/cli searcher
- support wiki-style links, with id only (for archive users)
- docs
    - get readme working in extension preview in vscode
    - make screenshot show in extension preview
    - prevent github link replacement in example file links
- lucene search bug: '+' operator not working as expected:
    - using lucene
    - search for #work: no results
    - search for book: many results
    - search for +#work book:
        - expected: no results
        - actual:   many results
- separate view for search results + related files etc.
    - I want to see file tree at same time
    - search box in results view. not supported in tree view
- highlight dead links while editing
