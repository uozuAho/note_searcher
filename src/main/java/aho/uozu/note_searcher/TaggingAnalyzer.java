package aho.uozu.note_searcher;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;

import java.io.IOException;
import java.io.StringReader;

public class TaggingAnalyzer extends Analyzer {

    public TaggingAnalyzer() {}

    @Override
    protected TokenStreamComponents createComponents(String fieldName) {
        return new TokenStreamComponents(new StandardTokenizer());
    }

    public static void main(String[] args) throws IOException {
        final String text = "This is a demo of the TokenStream API";

        var analyzer = new TaggingAnalyzer();
        var stream = analyzer.tokenStream("field", new StringReader(text));

        // get the CharTermAttribute from the TokenStream...what???
        var termAtt = stream.addAttribute(CharTermAttribute.class);

        try {
            stream.reset();

            while (stream.incrementToken()) {
                System.out.println(termAtt.toString());
            }

            stream.end();
        } finally {
            stream.close();
        }
    }
}