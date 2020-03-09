#!/bin/bash

./build.dist.sh
java -jar dist/note_searcher.jar "$@"
