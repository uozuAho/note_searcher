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

Search queries are expected to be in lucene classic parser syntax, see:
https://lucene.apache.org/core/8_0_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description

Some examples:

Must contain a word: `+word`
Search by document field: `field:value`

Available fields are
- contents (default)
- tag: 'tagged' text within documents, eg. #great #games #icecream
- path: file path
- modified: file modification timestamp

Currently searching by tag requires that you enter the hash prefix in the search,
eg. `tag:#games`. I'm trying to fix this...

## Todo

- vs code plugin
- stop requiring hash in tag searches
- watch directories, continuously build index

## References
- http://shaierera.blogspot.com/2016/01/indexing-tagged-data-with-lucene.html
- https://lucene.apache.org/core/8_4_1/core/index.html has some demos
- http://intelligiblebabble.com/custom-lucene-tokenizer-for-tech-keywords/
- https://www.toptal.com/database/full-text-search-of-dialogues-with-apache-lucene