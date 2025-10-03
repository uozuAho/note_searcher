# Change Log

All notable changes to the "note-searcher" extension will be documented in this
file. Format inspired by https://keepachangelog.com/en/1.0.0/

## [3.3.1] - 2025-09-03
### Fixed
- Minor text replacement bugs when updating wiki links on file rename

## [3.3.0] - 2025-09-02
### Added
- Wiki links are updated when a file is renamed
### Changed
- Updated supported vscode.engine to 1.104.0. Dunno if this actually changes
  anything.
### Security
- Updating library dependencies

## [3.2.0] - 2025-09-01
### Added
- When creating a new note, the filename is used to create a note heading

## [3.1.5] - 2025-08-30
### Security
- Updating library dependencies

## [3.1.4] - 2025-01-16
### Security
- Updating library dependencies

## [3.1.3] - 2024-09-19
### Security
- Updating library dependencies

## [3.1.2] - 2024-03-02
### Changed
- Fixed broken build in 3.1.1

## [3.1.1] - 2024-03-02 - BROKEN
### Security
- Updating library dependencies

## [3.1.0] - 2023-10-12
### Added
- Autocomplete for wiki links

## [3.0.2] - 2023-10-06
### Changed
- Docs: trying to make screenshots show up in marketplace and extension browser

## [3.0.1] - 2023-10-05
### Changed
- New icon
- Updated docs

## [3.0.0] - 2023-09-27
### Removed
- config: no longer supported. This includes ignoring file/directory patterns
  from indexing.
### Changed
- Faster indexing: The workspace is indexed once on startup, then incrementally
  updated as files are modified. Previously, every file saved caused a reindex
  of the workspace.

## [2.0.0] - 2023-07-12
### Changed
Wiki links no longer match on substrings - exact filenames are expected. For
example, [[cheese]] will no longer match with [[cheese_hat]]. If filenames are
duplicated across directories, multiple matches are returned.

## [1.0.6] - 2023-07-07
### Security
- Updating library dependencies

## [1.0.5] - 2023-03-03
### Security
- Updating library dependencies

## [1.0.4] - 2022-11-26
### Security
- Updating library dependencies

## [1.0.3] - 2022-07-23
### Security
- Updating library dependencies

## [1.0.2] - 2021-11-01
### Fixed
- File conflict when saving a new note

## [1.0.1] - 2021-09-26
### Fixed
- Error: EMFILE: too many open files for folders with lots of files
  - [github issue 6](https://github.com/uozuAho/note_searcher/issues/6)

## [1.0.0] - 2021-05-06
Calling this release 1.0.0, since I've been using this thing for ages pretty
happily without needing any changes.

### Added
- add 'forward links' to sidebar ('Links from this note')

### Changed
- increased maximum number of search results to 20
- renamed 'backlinks' in sidebar to 'Links to this note'

## [0.0.25] - 2021-01-26
### Added
- ignore directories via .noteSearcher.config.json file in root directory

## [0.0.24] - 2020-12-28
### Added
- backlinks now support wiki links

### Changed
- wiki links within code blocks are ignored

## [0.0.23] - 2020-12-06
### Added
- copy wiki link from file explorer

## [0.0.22] - 2020-11-19
### Added
- copy wiki link from search results and editor tab

## [0.0.21] - 2020-11-15
### Added
- dead wiki links now shown in the sidebar

### Fixed
- dead links not showing on vscode startup

### Changed
- ignores all directories containing "node_modules"

## [0.0.20] - 2020-11-14
### Changed
- extension is now always activated on startup. No more prompts to
  enable/disable. As a result, wiki links are now clickable on startup.

## [0.0.19] - 2020-11-10
### Added
- wikilink navigation and highlighting

## [0.0.18] - 2020-09-03
### Fixed
- words within markdown links are all full-text searchable
- words separated by slashes eg. red/green are now searchable

## [0.0.17] - 2020-08-02
### Added
- Show backlinks in sidebar
- Show all tags in sidebar

### Changed
- Dead links are now shown in the sidebar. Config no longer necessary - this
  feature is always on.
- Removed 'related files' section in sidebar
- Copied markdown links on windows are now in posix format

## [0.0.16] - 2020-06-10
### Added
- Show dead links on save (enable in preferences - off by default)

## [0.0.15] - 2020-05-31
### Fixed
- Every second tag in a consecutive run not being indexed. Eg. For '#a #b #c',
  '#b' was not indexed, thus didn't show up in autocomplete.

### Changed
- Tags before punctuation are now indexed, eg. '#a, #b? #c!'
- 'Indexing' notifications moved to status bar

## [0.0.14] - 2020-05-25
### Added
- Copy markdown link from editor tab

### Changed
- Renamed 'Copy relative path' in search results to 'Copy link'

## [0.0.13] - 2020-05-24
### Fixed
- deleted tags showing up in tag completion

## [0.0.12] - 2020-05-10
### Added
- tag completion within notes

### Changed
- Show search results container when search completes. Only works if there's
  at least one search result :(

## [0.0.11] - 2020-05-06
### Changed
- created note is saved in same directory is currently open note
- if notes are open, created note is saved in root directory

## [0.0.10] - 2020-05-03
### Added
- copy markdown link from search result

## [0.0.9] - 2020-05-02
### Added
- create a new note

## [0.0.8] - 2020-04-26
### Changed
- Removed Java dependency by using lunr search engine
- Added config option `noteSearcher.search.useLucene` (defaults to false)

## [0.0.7] - 2020-04-19
### Added
- support for hyphenated tags, eg. #public-speaking

## [0.0.6] - 2020-04-12
### Added
- commands to enable/disable indexing in the current directory
- prompt to enable indexing in current directory

### Fixed
- search doesn't work after opening new folder: index is now updated on activation

## [0.0.5] - 2020-04-10
### Added
- Show dead links on save (undocumented)

## [0.0.4] - 2020-04-05
### Fixed
- remove local search index from distributed package

## [0.0.3] - 2020-04-05
### Fixed
- 'command not found' on any extension action

## [0.0.2] - 2020-04-04
- Initial release (broken!)
