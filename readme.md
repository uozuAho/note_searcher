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
build :shrug:.


## Run the extension locally

Open the vscode directory with VS code, and run the `Run Extension`
configuration.


## Build the extension locally

Run `npm run build_vsix` in the vscode directory.


# todo
- feature(s): pasting links
    - try this: https://stackoverflow.com/questions/44598894/in-a-vs-code-extension-how-can-i-be-notified-when-the-user-cuts-copies-or-paste
    - if no selected text: set cursor inside []
    - if text selected: use selected text as description. eg. 'this' becomes [this]()
- feature: structure tags? popular tags? similar tags? root tags?
    - what I want (I think): links to similar notes based on tags
- CI: only 1 test runs on ubuntu
- bug: e2e test failures don't break CI
- better icon
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
