package aho.uozu.note_searcher.analysis;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.Tokenizer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.util.CharTokenizer;

import java.io.IOException;
import java.io.StringReader;

public class TaggingAnalyzer extends Analyzer {

    public TaggingAnalyzer() {}

    @Override
    protected TokenStreamComponents createComponents(String fieldName) {
//        return new TokenStreamComponents(new StandardTokenizer());
        final Tokenizer tokenizer = new TaggingTokenizer();
        final TokenStream stream = new TaggingTokenFilter(tokenizer);
        return new TokenStreamComponents(tokenizer, stream);
    }

    public static void main(String[] args) throws IOException {
        final String text = "Demo-text, Including \"tags\" like #wow. Not a tag: #";

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

    private class TaggingTokenizer extends CharTokenizer {
        @Override
        protected boolean isTokenChar(int c) {
            return Character.isLetterOrDigit(c) || c == '#';
        }
    }

    private class TaggingTokenFilter extends TokenFilter {
        private CharTermAttribute _termAtt;

        public TaggingTokenFilter(TokenStream input)
        {
            super(input);
            this._termAtt = this.addAttribute(CharTermAttribute.class);
        }

        @Override
        public boolean incrementToken() throws IOException {
            while (this.input.incrementToken()) {
                char[] term = _termAtt.buffer();
                if (containsHash(term)) {
                    // contains a hash but isn't a tag: ignore
                    if (!isATag(_termAtt)) continue;

                    // it's a tag. Remove the hash from the buffer.
                    _termAtt.copyBuffer(_termAtt.buffer(), 1, _termAtt.length() - 1);
                }
                return true;
            }
            return false;
        }

        private boolean isATag(CharTermAttribute term) {
            if (term.length() < 2) return false;
            char[] chars = term.buffer();
            return chars[0] == '#' && Character.isLetterOrDigit(chars[1]);
        }

        private boolean containsHash(char[] chars) {
            for (char c : chars) {
                if (c == '#') {
                    return true;
                }
            }
            return false;
        }
    }
}