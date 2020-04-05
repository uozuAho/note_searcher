#!/bin/bash

set -eu

echo "building jar..."
pushd cli
./build.dist.sh
mkdir -p ../vscode/dist
cp dist/note_searcher.jar ../vscode/dist
popd

echo
echo "building vscode extension..."
pushd vscode
./build.extension.sh
popd

echo
echo "done! vscode extension output:"
ls vscode/*.vsix
