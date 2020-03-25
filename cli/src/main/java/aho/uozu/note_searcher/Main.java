package aho.uozu.note_searcher;

import aho.uozu.note_searcher.analysis.EnglishWithTagsAnalyzer;
import org.apache.lucene.queryparser.classic.ParseException;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) {
        try {
            var command = CliParser.parseCommand(args);

            switch (command) {
                case index:
                    runIndex(CliParser.parseDirectoryToIndex(args));
                    break;
                case search:
                    runSearch(CliParser.parseSearchQuery(args));
                    break;
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void runIndex(Path dir) throws URISyntaxException, IOException {
        var indexPath = Paths.indexPath();
        var indexer = new Indexer(indexPath, EnglishWithTagsAnalyzer.create());
        indexer.indexDirectory(dir, false);
    }

    private static void runSearch(String query) throws IOException, ParseException, URISyntaxException {
        var searcher = Searcher.fromPath(Paths.indexPath(), EnglishWithTagsAnalyzer.create());
        var results = searcher.search(query);

        Searcher.printSearchResults(query, results);
    }
}
