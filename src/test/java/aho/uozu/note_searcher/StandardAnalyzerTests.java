package aho.uozu.note_searcher;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.memory.MemoryIndex;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class StandardAnalyzerTests {
    private StandardAnalyzer _analyzer;
    private MemoryIndex _index;

    @Before
    public void setup() {
        _analyzer = new StandardAnalyzer();
        _index = new MemoryIndex();
        _index.addField("content", "Readings about Salmons and other select Alaska fishing Manuals", _analyzer);
        _index.addField("author", "Tales of James", _analyzer);
    }

    @Test
    public void isCaseInsensitive() throws ParseException {
        float score = search("Salmons Alaska Manuals");
        float lowercaseScore = search("salmons alaska manuals");

        assertThat(score, equalTo(lowercaseScore));
    }

    @Test
    public void stopWordsGetLowScores() throws ParseException {
        float score = search("and");

        assertThat(score, lessThan(0.2f));
    }

    @Test
    public void complexSearch() throws ParseException {
        assertFound("+author:james +salmon~ +fish* manual~");
    }

    private void assertFound(String query) throws ParseException {
        float score = search(query);

        assertThat(score, greaterThan(0.5f));
    }

    private void assertNotFound(String query) throws ParseException {
        float score = search(query);

        assertThat(score, lessThan(0.00001f));
    }

    private float search(String query) throws ParseException {
        QueryParser parser = new QueryParser("content", _analyzer);
        return _index.search(parser.parse(query));
    }
}
