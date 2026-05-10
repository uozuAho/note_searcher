# Code explainer

Welcome human and machine coders. This project is a visual studio code extension
that provides full text search and wiki-style links with forward and backward
link navigation.

# project structure and important types
- ./src/note_searcher/noteSearcher.ts
    - `NoteSearcher`
        - this is the central hub through which most extension functionality is
          coordinated
        - has
            - ui:           INoteSearcherUi
            - index:        IMultiIndex
            - fs:           FileSystem
            - timeProvider: TimeProvider
- ./src/ui/INoteSearcherUi.ts
    - `INoteSearcherUi`
        - interface to the UI, which in this extension's case is VS code
        - main implementation: VsCodeNoteSearcherUi
- ./src/index/MultiIndex.ts
    - `IMultiIndex`
        - single interface to all indexing functionality: full text, links
- ./src/index/DefaultMultiIndex.ts
    - `DefaultMultiIndex` (implements IMultiIndex)
        - has
            - InMemoryLinkIndex: implements LinkIndex, NoteIndex
- ./src/utils/IFileSystem.ts
    - `IFileSystem`
        - interface to filesystem operations


# extension initialisation & plumbing
The extension initialises immediately (see `activationEvents` in package.json).
While this is not recommended, it's fine for my use as I only have the extension
enabled in certain workspaces.

Initialisation happens in ./src/main.ts. This is where all major classes
are built, connected together, and connected to the vscode extension framework.

# testing
Most tests are low level and easy to follow. There are a couple of exceptions:

## DefaultMultiIndex
There are a couple of files that contain tests:

./src/index/DefaultMultiIndex.test.ts
./src/index/DefaultMultiIndex.demoDir.test.ts

DefaultMultiIndex may look like just an index of indexes, but it's really a
coordinator. There is enough complexity within it to warrant testing. I don't
think there's a way to simplify this, so I try to be careful not to duplicate
test responsibilities between here and the individual indexes.

## Acceptance tests
./src/acceptance_tests/noteSearcher.acceptance.test.ts

The intent here is to test something as close as possible to the actual
extension. It replaces a previous attempt that used a selenium-like driver that
tested the real extension by driving the VS code UI. The previous attempt was
abandoned since the UI driver often broke, and had typical UI test shortcomings
like low speed and reliability.

The test file mocks out all external dependencies such as:
- the ui
- filesystem
- vs code definition providers

It then calls the real `activate` from main.ts.

The resulting object hierarchy is:

- NoteSearcher
    - FakeUi (fake NoteSearcherUi)
    - MultiIndex
        - LunrDualFts
            - LunrFullTextSearch
            - InMemFileSystem (in memory implementation of FileSystem)
        - InMemFileSystem
        - DateTimeProvider

The tests then 'drive' the extension using `FakeVsCodeNoteSearcher`. This class
has a reference to `FakeUi`, and is intended to have an API that resembles using
VS code with the extension.

Not tested:
- wikilink completion:  simple, doesn't change often, don't care
- link navigation:      simple, doesn't change often, don't care
- real ui actions: given VsCodeNoteSearcherUi is a pretty dumb plumbing object,
                   there's not too much risk here. If I'm worried, I'll test the
                   real extension manually.

Although mocking out external dependencies is complex and often a source of
confusion, I still prefer it to the old flakey UI tests. Everything is under my
control, and the tests are fast.
