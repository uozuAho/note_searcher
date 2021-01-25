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
# optionally, run e2e tests (broken)
npm run e2e:setup
./run_e2e.sh
```

e2e tests use https://github.com/redhat-developer/vscode-extension-tester

Currently the e2e tests for clipboard stuff fail locally, but pass in the CI
build :shrug:. I'm reconsidering their value, and may try to find a different
strategy.


## Run the extension locally

Open the vscode directory with VS code, and run the `Run Extension`
configuration.


## Build the extension locally

Run `npm run build_vsix` in the vscode directory.


# todo
- ignore
    - make ignore dirs configurable
- e2e tests worth it?
    - fail locally and in CI, but features work
    - find another testing lib?
- CI: only 1 test runs on ubuntu
- feature: autocomplete wiki links
- feature: set cursor inside [] when pasting link
- feature: paste link onto existing text, eg onto 'this' becomes [this]()
- bug: e2e test failures don't break CI
- fix dead link e2e fail on ubuntu
- better icon
- feature: ## tags for structure notes
    - hmm. just use regular search for ##....
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
