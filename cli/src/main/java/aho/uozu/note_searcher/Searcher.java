package aho.uozu.note_searcher;

import aho.uozu.note_searcher.analysis.EnglishWithTagsAnalyzer;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.store.FSDirectory;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

class Searcher {
    private final IndexSearcher _indexSearcher;
    private final Analyzer _analyzer;

    public Searcher(IndexSearcher searcher, Analyzer analyzer) {
        _indexSearcher = searcher;
        _analyzer = analyzer;
    }

    public static Searcher fromPath(Path indexPath, Analyzer analyzer) throws IOException {
        var indexSearcher = fsIndexSearcher(indexPath);
        return new Searcher(indexSearcher, analyzer);
    }

    public List<SearchResult> search(String queryString)
            throws IOException, ParseException
    {
        // todo: config for this
        final int searchResultLimit = 10;

        var query = parseQuery(queryString);

        var hits = _indexSearcher.search(query, searchResultLimit).scoreDocs;

        return Arrays.stream(hits)
                .map(hit -> SearchResult.build(_indexSearcher, hit))
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

    private static IndexSearcher fsIndexSearcher(Path indexDir) throws IOException {
        var indexReader = DirectoryReader.open(FSDirectory.open(indexDir));
        return new IndexSearcher(indexReader);
    }

    private Query parseQuery(String queryText) throws ParseException {
        return new QueryParser(EnglishWithTagsAnalyzer.CONTENT_FIELD, _analyzer).parse(queryText);
    }
}
