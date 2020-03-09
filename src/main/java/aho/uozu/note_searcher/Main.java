package aho.uozu.note_searcher;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.search.IndexSearcher;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        try {
            var queryString = getQueryText(args);
            var results = search(queryString);

            printSearchResults(queryString, results);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String getQueryText(String args[]) {
        if (args.length == 0) return "where is my soup";
        return args[0];
    }

    private static List<SearchResult> search(String queryString)
            throws IOException, ParseException
    {
        // todo: config for this
        final int searchResultLimit = 10;
        var indexPath = "C:/Users/boozFamily/Downloads/lucene-8.4.1/demo/index";

        var indexReader = DirectoryReader.open(FSDirectory.open(Paths.get(indexPath)));
        var searcher = new IndexSearcher(indexReader);
        var analyzer = new StandardAnalyzer();
        var queryParser = new QueryParser("contents", analyzer);

        var query = queryParser.parse(queryString);
        var hits = searcher.search(query, searchResultLimit).scoreDocs;

        return Arrays.stream(hits)
                .map(hit -> SearchResult.build(searcher, hit))
                .collect(Collectors.toList());
    }

    private static void printSearchResults(String queryString, List<SearchResult> results) {
        if (results.size() == 0) {
            System.out.println("No results for query '" + queryString + "'");
        }
        else {
            System.out.println("Top results for query '" + queryString + "':");
            for (var result : results) {
                System.out.println(result.path);
            }
        }
    }
}
