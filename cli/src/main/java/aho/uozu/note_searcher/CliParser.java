package aho.uozu.note_searcher;

import java.nio.file.Path;

class CliParser {
    public enum Command {
        search,
        index
    }

    public static Command parseCommand(String[] args) {
        if (args.length == 0) throw new IllegalStateException("need at least one arg");
        if (args[0].trim().toLowerCase().equals("search")) return Command.search;
        if (args[0].trim().toLowerCase().equals("index")) return Command.index;
        throw new IllegalStateException("unknown command: " + args[0]);
    }

    public static String parseSearchQuery(String[] args) {
        if (args.length <= 1) throw new IllegalStateException("gimme a search phrase");
        return args[1];
    }

    public static Path parseDirectoryToIndex(String[] args) {
        if (args.length <= 1) throw new IllegalStateException("gimme a directory to index");
        return java.nio.file.Paths.get(args[1]);
    }
}
