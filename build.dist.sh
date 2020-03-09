#!/bin/bash

./gradlew shadowJar

rm -rf dist
mkdir dist

cp build/libs/note_searcher2-1.0-SNAPSHOT-all.jar dist/note_searcher.jar
