# Note Searcher

Tool for managing a knowledge base of text files, such as a zettelkasten.


## Feature summary

- Full text search:  `ctrl+alt+s`
- Create a new note: `ctrl+alt+n`
- Tag autocompletion
- Copy markdown link to note from search results
- Copy markdown link to note from editor tab
- Find dead links


## How to use this extension

![extension screenshot](./img/ext_screenshot.png)


### Full text search

When active, this extension indexes all .md, .txt and .log files in the
currently open folder. As you are modifying a file, the extension window will
show a list of files related to the current file, based on keywords and tags
extracted from the current file.

You can also search for files by pressing `ctrl+alt+s`. Some example queries:

```
apple banana +carrot  # file contains the word carrot, and possibly apple or banana
apple banana -carrot  # file does not contain carrot, but either apple and/or banana
apple banana #food    # file contains apple, banana, and/or the tag #food
```


### Tags

Any word starting with a '#' character is considered a tag, allowing for
tag-based searching. #hyphenated-tags are supported.

When note searcher is enabled, typing '#' will show a list of tags which have
been found in other files.


### Creating notes

Press `ctrl+alt+n` to create a new note in the currently open directory.


### Linking notes

With VS Code, you can add links to local files using markdown
syntax. These become hyperlinks to your local files. Examples:

- `[](path/relative/to/file)`
- `[](/file/relative/to/currently/open/dir/in/vscode)`

You can copy a markdown-style link to a search result by right-clicking on
the search result. You can also copy this link from an editor tab.


### Find dead links

To find dead links, add the following line to your VS Code preferences:

`"noteSearcher.deadLinks.showOnSave": true`

Now whenever you save a file, all files will be searched for links to other
files. If any links to non-existent files are found, they will be displayed
in a new editor.


## UNDER CONSTRUCTION

This extension is still under development, and has a bunch of rough edges.
If you find any problems or have any questions, please create an issue at
https://github.com/uozuAho/note_searcher/issues
