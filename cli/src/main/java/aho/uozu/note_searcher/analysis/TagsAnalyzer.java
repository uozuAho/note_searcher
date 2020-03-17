package aho.uozu.note_searcher.analysis;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.Tokenizer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.util.CharTokenizer;

import java.io.IOException;
import java.io.StringReader;

public class TagsAnalyzer extends Analyzer {

    public TagsAnalyzer() {}

    @Override
    protected TokenStreamComponents createComponents(String fieldName) {
        final Tokenizer tokenizer = new TagsTokenizer();
        TokenStream stream = new TagsTokenFilter(tokenizer);
        return new TokenStreamComponents(tokenizer, stream);
    }

    public static void main(String[] args) throws IOException {
        final String text = "Demo-text, Including \"tags\" like #wow. Not a tag: #";

        var analyzer = new TagsAnalyzer();
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

    private static class TagsTokenizer extends CharTokenizer {
        @Override
        protected boolean isTokenChar(int c) {
            return Character.isLetterOrDigit(c) || c == '#';
        }
    }

    /** A 'filtering filter' that only returns tag tokens */
    private static class TagsTokenFilter extends TokenFilter {
        private CharTermAttribute _termAtt;

        public TagsTokenFilter(TokenStream input) {
            super(input);
            this._termAtt = this.addAttribute(CharTermAttribute.class);
        }

        @Override
        public boolean incrementToken() throws IOException {
            while (this.input.incrementToken()) {
                if (!isATag(_termAtt)) continue;
                removeHashPrefix();
                return true;
            }
            return false;
        }

        private void removeHashPrefix() {
            _termAtt.copyBuffer(_termAtt.buffer(), 1, _termAtt.length() - 1);
        }

        private boolean isATag(CharTermAttribute term) {
            if (term.length() < 2) return false;
            char[] chars = term.buffer();
            return chars[0] == '#' && Character.isLetterOrDigit(chars[1]);
        }
    }
}
