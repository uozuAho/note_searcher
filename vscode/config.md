Add support for a .notesearcher config file in the root of the workspace. The
config file should be json formatted. It should have a single supported field:
`ignore_paths_containing: str[]`. When searching/indexing, notesearcher should
ignore paths that contain any of the substrings in this array.
