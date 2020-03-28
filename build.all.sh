#!/bin/bash

set -eu

echo "building jar..."
pushd cli
./build.dist.sh
cp dist/note_searcher.jar ../vscode/out
popd

echo
echo "building vscode extension..."
pushd vscode
./build.extension.sh
cp *.vsix ..
popd

echo
echo "done! vscode extension copied to this dir:"
ls *.vsix
