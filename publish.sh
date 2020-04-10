#!/bin/bash

# UNTESTED! HAVE FUN :)

set -eu

## YOU THERE! SET THESE BEFORE RUNNING:
VERSION_INCREMENT=patch  # [major|minor|patch]
## OK THAT'S IT

pushd cli
./gradlew test
popd

pushd vscode
npm run test
npm version $VERSION_INCREMENT
popd

./build.all.sh

echo
echo Please install the package and make sure it works
echo Then open publish.sh and uncomment the following steps:

# git add .
# git commit -m "increment version to XXX"
# git tag XXX
# git push
# git push --tags
# vsce publish
