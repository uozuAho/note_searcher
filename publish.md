# Publishing the extension

Publishing is done by tagging master. Before you do:

- Ensure the version has been incremented

    cd vscode
    npm version [major|minor|patch]

- Ensure the changelog is up to date
- Merge/commit to master, tag
- Push, including tags `git push --tags`
