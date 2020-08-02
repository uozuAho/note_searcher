# Publishing the extension

Publishing is done by tagging master. Before you do:

- Ensure the version has been incremented

    cd vscode
    npm version [major|minor|patch]

- Ensure the changelog & docs are up to date
- Merge/commit to master, `git tag releases/x.x.x`
- Push, including tags `git push && git push --tags`
