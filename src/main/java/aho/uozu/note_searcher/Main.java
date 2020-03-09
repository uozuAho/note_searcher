package aho.uozu.note_searcher;

import org.apache.lucene.queryparser.classic.ParseException;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) {
        try {
            var command = parseCommand(args);

            switch (command) {
                case index:
                    runIndex(args);
                    break;
                case search:
                    runSearch(args);
                    break;
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    enum Command {
        search,
        index
    }

    private static Command parseCommand(String args[]) {
        if (args.length == 0) throw new IllegalStateException("need at least one arg");
        if (args[0].trim().toLowerCase().equals("search")) return Command.search;
        if (args[0].trim().toLowerCase().equals("index")) return Command.index;
        throw new IllegalStateException("unknown command: " + args[0]);
    }

    private static void runIndex(String[] args) throws URISyntaxException, IOException {
        var jarDir = Paths.get(Main.class.getProtectionDomain().getCodeSource().getLocation().toURI()).getParent();
        var indexPath = Paths.get(jarDir.toString(), "index");
        var indexer = new Indexer(indexPath);
        var dirToIndex = getDirectoryToIndex(args);
        indexer.indexDirectory(dirToIndex, false);
    }

    private static void runSearch(String[] args) throws IOException, ParseException {
        var queryString = getQueryText(args);
        var results = Searcher.search(queryString);

        Searcher.printSearchResults(queryString, results);
    }

    private static String getQueryText(String args[]) {
        if (args.length == 1) return "where is my soup";
        return args[1];
    }

    private static String getDirectoryToIndex(String[] args) {
        if (args.length <= 1) throw new IllegalStateException("no");
        return args[1];
    }
}
