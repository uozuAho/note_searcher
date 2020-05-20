#!/bin/bash
#
# Builds the search cli and puts it in the
# vscode extension

set -eu

echo "building jar..."
pushd cli
./build.dist.sh
mkdir -p ../vscode/dist
cp dist/note_searcher.jar ../vscode/dist
popd
