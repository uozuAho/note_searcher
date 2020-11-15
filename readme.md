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
- feature: wiki links
    - ctrl+click navigation: DONE
    - highlighting: DONE
    - show dead links: DONE
    - show backlinks
    - docs
- feature: set cursor inside [] when pasting link
- feature: paste link onto existing text, eg onto 'this' becomes [this]()
- bug: e2e test failures don't break CI
- feature: configurable new note directory
    - if not set, use current behaviour
    - set in dotfile???
- fix dead link e2e fail on ubuntu
- better icon
- feature: ## tags for structure notes
- feature: copy link from file explorer
- break up noteSearcher.ts?
    - test file is unwieldy
- feature: suggest tags in search
    - not yet available: https://github.com/microsoft/vscode/issues/35785
- feature: extract text to new note
- improve: don't index if already indexing, eg. saving multiple files
- docs
    - get readme working in extension preview in vscode
    - make screenshot show in extension preview
    - prevent github link replacement in example file links
- highlight dead links while editing
