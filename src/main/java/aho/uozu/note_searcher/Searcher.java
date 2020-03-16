package aho.uozu.note_searcher;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.FSDirectory;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

class Searcher {
    private final Path _indexPath;
    private final Analyzer _analyzer;

    public Searcher(Path indexPath, Analyzer analyzer) {
        this._indexPath = indexPath;
        this._analyzer = analyzer;
    }

    public List<SearchResult> search(String queryString)
            throws IOException, ParseException
    {
        // todo: config for this
        final int searchResultLimit = 10;

        var indexReader = DirectoryReader.open(FSDirectory.open(this._indexPath));
        var searcher = new IndexSearcher(indexReader);
        var queryParser = new QueryParser("contents", _analyzer);

        var query = queryParser.parse(queryString);
        var hits = searcher.search(query, searchResultLimit).scoreDocs;

        return Arrays.stream(hits)
                .map(hit -> SearchResult.build(searcher, hit))
                .collect(Collectors.toList());
    }

    public static void printSearchResults(String queryString, List<SearchResult> results) {
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
