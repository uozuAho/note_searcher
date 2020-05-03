# Note Searcher

Full-text and tag-based searching of arbitrary directories and files.
Lets you make your own zettelkasten! Inspired by https://zettelkasten.de/.
Also contains some shortcuts for creating new notes.


## UNDER CONSTRUCTION

This extension is still under development, and has a bunch of rough edges.
If you find any problems or have any questions, please create an issue at
https://github.com/uozuAho/note_searcher/issues


## How to use this extension

![extension screenshot](./img/ext_screenshot.png)


### Summary

- Search for notes:  `ctrl+alt+s`
- Create a new note: `ctrl+alt+n`
- Copy link to note from search results


### Search

When active, this extension indexes all .md, .txt and .log files in the
currently open folder. As you are modifying a file, the extension window will
show a list of files related to the current file, based on keywords and tags
extracted from the current file.

You can also search for files by pressing ctrl+alt+s. Some example queries:

```
apple banana +carrot  # file contains the word carrot, and possibly apple or banana
apple banana -carrot  # file does not contain carrot, but either apple and/or banana
apple banana #food    # file contains apple, banana, and/or the tag #food
```

Any word starting with a '#' character is considered a tag, allowing for
tag-based searching. #hyphenated-tags are supported.


### Creating notes

Press `ctrl+alt+n` to create a new note in the currently open directory.


### Linking notes

With VS Code, you can add links to local files using markdown
syntax. These become hyperlinks to your local files! Examples:

- `[](path/relative/to/file)`
- `[](/file/relative/to/currently/open/dir/in/vscode)`

You can copy a markdown-style link to a search result by right-clicking on
the search result.
