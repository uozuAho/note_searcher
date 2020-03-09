import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.search.IndexSearcher;

import java.nio.file.Paths;

public class Main {
    public static void main(String[] args) {
        try {
            final int searchResultLimit = 10;
            var queryString = "where is my soup";
            if (args.length > 0) {
                queryString = args[0];
            }

            // todo: config for this
            var indexPath = "C:/Users/boozFamily/Downloads/lucene-8.4.1/demo/index";

            var indexReader = DirectoryReader.open(FSDirectory.open(Paths.get(indexPath)));
            var searcher = new IndexSearcher(indexReader);
            var analyzer = new StandardAnalyzer();
            var queryParser = new QueryParser("contents", analyzer);

            var query = queryParser.parse(queryString);
            var hits = searcher.search(query, searchResultLimit).scoreDocs;

            System.out.println("Top results for query '" + queryString + "':");

            for (int i = 0; i < hits.length; i++) {
                var doc = searcher.doc(hits[i].doc);
                String path = doc.get("path");
                if (path != null) {
                    System.out.println((i + 1) + ". " + path);
                    String title = doc.get("title");
                    if (title != null) {
                        System.out.println("   Title: " + doc.get("title"));
                    }
                } else {
                    System.out.println((i + 1) + ". " + "No path for this document");
                }
            }
        }
        catch (Exception e) {
            System.out.println(e);
        }
    }
}
