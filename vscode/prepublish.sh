#!/bin/bash

mkdir -p out

echo "building jar..."
pushd ../cli
./build.dist.sh
cp dist/note_searcher.jar ../vscode/out
popd

echo "compiling extension..."
npm run compile
