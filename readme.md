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


## Updating dependencies

Speedrun:

```sh
cd vscode
npm outdated
npm update
npm test
npm outdated
# if any major updates available:
npm rm [list] [of] [deps] [to] [update]
npm i -D <same list as above>
npm test
# just in case:
npm audit
# make sure it still builds:
npm run webpack
```


# todo
- bug?
    - search for something
    - edit a doc to contain that something
    - search again
    - expected: edited doc near the top
    - actual: edited doc near the bottom
- feature: extract text to new note
- feature: make paths queryable. Eg. i want to exclude ABC from path, but not contents
- feature(s): pasting links
    - try this: https://stackoverflow.com/questions/44598894/in-a-vs-code-extension-how-can-i-be-notified-when-the-user-cuts-copies-or-paste
    - if no selected text: set cursor inside []
    - if text selected: use selected text as description. eg. 'this' becomes [this]()
- cleanup: replace mocked/other high level tests with acceptance tests
- feature: suggest tags in search
    - not yet available: https://github.com/microsoft/vscode/issues/35785
- improvement: dead links should navigate to the offending link text
