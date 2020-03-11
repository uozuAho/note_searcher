# Notes searcher

Full-text and tag-based searching of arbitrary directories and files.
Lets you make your own zettelkasten! Inspired by https://zettelkasten.de/.

This is a console-base tool, intended to be used in text-editor plugins,
or just on the console if you like!


## Development

To build the distributable jar plus runner script

> ./build.dist.sh  # output sent to dist/

The following scripts build the distributable jar before using it, so won't be
as fast as just running the jar.

Before running any searches, you need to rebuild the search index. To do so:

> ./note_searcher.sh index /path/to/index

This builds the index next to the distributable jar.

To run a search:

> ./note_searcher.sh search "your search query"  # quotes are required for multiple words


## Todo

- tag parser/searcher
    tokenizer? annotator? analyser????
    http://shaierera.blogspot.com/2016/01/indexing-tagged-data-with-lucene.html
    https://lucene.apache.org/core/5_4_0/core/org/apache/lucene/analysis/package-summary.html
- vs code plugin???
- full text search:
    - is lucene query language easy to use? document some
        see https://lucene.apache.org/core/2_9_4/queryparsersyntax.html
    - dont use args directly as search quer
        - eg. "!" breaks parser
        - how to do phrases, NOT, AND, OR etc...?
    - what other search features does lucene have? titles, authors etc.
    - watch directories, continuously build index
