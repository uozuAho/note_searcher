# Notes searcher

## End goal

- Search notes using full-text and tag search
- Get started with zero config

Intended to useful like https://zettelkasten.de/, but

- works on windows
- console-based, intended to be used via a vs code extension


## Usage of this repo

To run a search:

> ./search.sh "your search query"  # quotes are required for multiple words

To rebuild the index: `TODO :)`

To build the distributable jar plus runner script

> ./build.dist.sh  # output sent to dist/


## Todo

- build index
- vs code plugin
- watch directories, continuously build index
