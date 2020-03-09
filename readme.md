# Notes searcher

## End goal

- Search notes using full-text and tag search
- Get started with zero config

Intended to useful like https://zettelkasten.de/, but

- works on windows
- console-based, intended to be used via a vs code extension


## Usage of this repo

To run a search:

> ./note_searcher.sh search "your search query"  # quotes are required for multiple words

To rebuild the index:

> ./note_searcher.sh index /path/to/index

To build the distributable jar plus runner script

> ./build.dist.sh  # output sent to dist/


## Todo
- remove default search query (the soup thing)
- dont use args directly as search query
    - eg. "!" breaks parser
    - how to do phrases, NOT, AND, OR etc...?
- tag parser/searcher
- what other search features does lucene have? titles, authors etc.
- vs code plugin
- watch directories, continuously build index
