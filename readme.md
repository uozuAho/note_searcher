# Notes searcher

Full-text and tag-based searching of arbitrary directories and files.
Lets you make your own zettelkasten! Inspired by https://zettelkasten.de/.

This is a console-base tool, intended to be used in text-editor plugins,
or just on the console if you like!


## Development

To build the distributable jar plus runner script

> ./build.dist.sh  # output sent to dist/

The following scripts build the distributable before using it.

Before running any searches, you need to rebuild the search index. To do so:

> ./note_searcher.sh index /path/to/index

This builds the index next to the distributable jar.

To run a search:

> ./note_searcher.sh search "your search query"  # quotes are required for multiple words


## Todo

- tag parser/searcher
- vs code plugin
- full text search:
    - dont use args directly as search query
        - eg. "!" breaks parser
        - how to do phrases, NOT, AND, OR etc...?
    - what other search features does lucene have? titles, authors etc.
    - watch directories, continuously build index
