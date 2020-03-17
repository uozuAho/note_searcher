package aho.uozu.note_searcher;

import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.index.memory.MemoryIndex;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class EnglishAnalyzerSearchTests {
    private EnglishAnalyzer _analyzer;
    private MemoryIndex _index;

    @BeforeEach
    public void setup() {
        _analyzer = new EnglishAnalyzer();
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
    public void ignoresPlurals() throws ParseException {
        float score = search("Salmons Alaska Manuals");
        float withoutPluralsScore = search("salmon alaska manual");

        assertThat(score, equalTo(withoutPluralsScore));
    }

    @Test
    public void complexExample() throws ParseException {
        float score = search("+author:james +salmon~ +fish* manual~");
    }

    @Test
    public void throwsParseException_ForBadQuery() {
        assertThrows(ParseException.class, () -> search("meat pie! yo +++ "));
    }

    private float search(String query) throws ParseException {
        QueryParser parser = new QueryParser("content", _analyzer);
        return _index.search(parser.parse(query));
    }
}
