# Publishing the extension

Publishing is done by tagging master. Before you do:

- Ensure the version has been incremented

    cd vscode
    npm version [major|minor|patch]

- Ensure the changelog & docs are up to date
- Merge/commit to master, `git tag releases/x.x.x`
- Push, including tags `git push && git push --tags`


# Token expired?
- log into azure devops
- goto org
- goto profile -> tokens
- create a token with scope: marketplace -> manage: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token
- save token to github
