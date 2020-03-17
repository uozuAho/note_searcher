package aho.uozu.note_searcher;

import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ScoreDoc;

import java.io.IOException;

class SearchResult {
    public final String path;

    public SearchResult(String path) {
        this.path = path;
    }

    public static SearchResult build(IndexSearcher searcher, ScoreDoc hit) {
        String path = null;
        try {
            path = searcher.doc(hit.doc).get("path");
        } catch (IOException e) {
            e.printStackTrace();
        }
        if (path != null) {
            return new SearchResult(path);
        } else {
            throw new IllegalStateException("doc without a path??? how does this work?");
        }
    }
}
