package aho.uozu.note_searcher;

import aho.uozu.note_searcher.analysis.EnglishWithTagsAnalyzer;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.index.memory.MemoryIndex;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;

public class EnglishWithTagsAnalyzerTests {
    private Analyzer _analyzer;
    private MemoryIndex _index;

    @BeforeEach
    public void setup() {
        String documentText =
                "Demo Text, Including \"tags\" like #wow. Many dogs. Not a tag: # meat";
        _analyzer = EnglishWithTagsAnalyzer.create();
        _index = new MemoryIndex();
        _index.addField(EnglishWithTagsAnalyzer.CONTENT_FIELD, documentText, _analyzer);
        _index.addField(EnglishWithTagsAnalyzer.TAG_FIELD, documentText, _analyzer);
    }

    @Test
    public void isCaseInsensitive() throws ParseException {
        float score = search("Demo Text");
        float lowercaseScore = search("demo text");

        assertThat(score, equalTo(lowercaseScore));
    }

    @Test
    public void ignoresPlurals() throws ParseException {
        float score = search("tags dogs");
        float withoutPluralsScore = search("tag dog");

        assertThat(score, equalTo(withoutPluralsScore));
    }

    @Test
    public void mustContainTag() throws ParseException {
        float score = search("+tag:#wow");

        assertThat(score, greaterThan(0f));
    }

    // todo: make this work
    @Test
    @Disabled("todo: make this work, better than above")
    public void mustContainTagBetter() throws ParseException {
        float score = search("+tag:wow");

        assertThat(score, greaterThan(0f));
    }

    @Test
    public void mustNotContainTag() throws ParseException {
        float score = search("+tag:#jabba");

        assertThat(score, equalTo(0f));
    }

    private float search(String query) throws ParseException {
        QueryParser parser = new QueryParser(EnglishWithTagsAnalyzer.CONTENT_FIELD, _analyzer);
        return _index.search(parser.parse(query));
    }
}
