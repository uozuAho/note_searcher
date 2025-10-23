# Notes searcher

VS code extension for managing a collection of local text files, eg. a
[zettelkasten](https://zettelkasten.de/posts/overview/).

Features:
- full text search
- shortcuts for creating and linking notes

See the [extension readme](./vscode/README.md) for more info.


# Contributing

## Quick start
Install nodejs (see [github actions](.github/workflows/main.yml) for which
version). Then:

```sh
cd vscode
npm ci
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

## Understanding the code/architecture
See [code explainer](./docs/code_explainer.md)


# todo
- feature: extract text to new note
- feature(s): pasting links
    - try this: https://stackoverflow.com/questions/44598894/in-a-vs-code-extension-how-can-i-be-notified-when-the-user-cuts-copies-or-paste
    - if no selected text: set cursor inside []
    - if text selected: use selected text as description. eg. 'this' becomes [this]()
- cleanup: replace mocked/other high level tests with acceptance tests
- improvement: dead links should navigate to the offending link text
