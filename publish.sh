#!/bin/bash

set -eu

## YOU THERE! SET THESE BEFORE RUNNING:
VERSION_INCREMENT=patch  # [major|minor|patch]
## OK THAT'S IT

# build runs the java cli tests
./build.all.sh

pushd vscode
npm run test
npm run e2e:setup
# todo: e2e test runner fails (not the tests)
npm run e2e
npm version $VERSION_INCREMENT
popd

# build again to create the extension package with the incremented version number
./build.all.sh

echo
echo Please install the package and make sure it works
echo Then open publish.sh and uncomment the following steps:

# update changelog
# git add .
# git commit -m "increment version to XXX"
# git tag XXX
# git push
# git push --tags
# pushd vscode
# vsce publish
# popd
