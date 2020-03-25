package aho.uozu.note_searcher;

import aho.uozu.note_searcher.analysis.EnglishWithTagsAnalyzer;
import org.apache.lucene.index.memory.MemoryIndex;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.hamcrest.Matcher;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class SearcherTests {
    @Test
    public void findsSingleWord() throws IOException, ParseException {
        assertThat(searchFor("ham", "the ham is good"), isFound());
    }

    @Test
    public void findsMultipleWords() throws IOException, ParseException {
        assertThat(searchFor("ham good", "the ham is good"), isFound());
    }

    @Test
    public void findsQuotedSequence() throws IOException, ParseException {
        assertThat(searchFor("\"ham is good\"", "the ham is good"), isFound());
    }

    @Test
    public void findsStemmedWord() throws IOException, ParseException {
        assertThat(searchFor("bike", "I own several bikes"), isFound());
    }

    @Test
    public void findsTag() throws IOException, ParseException {
        assertThat(searchFor("#beef", "The tags are #beef and #chowder"), isFound());
    }

    @Test
    public void findsTagWithTagQuerySyntax() throws IOException, ParseException {
        assertThat(searchFor("tag:#beef", "The tags are #beef and #chowder"), isFound());
    }

    // todo: fix tag search
    @Test
    @Disabled("Fix me: I want this to work")
    public void findsTagWithTagQuerySyntaxBetter() throws IOException, ParseException {
        assertThat(searchFor("tag:beef", "The tags are #beef and #chowder"), isFound());
    }

    @Test
    public void doesNotFindMissingWord() throws IOException, ParseException {
        assertThat(searchFor("pizza", "the ham is good"), isNotFound());
    }

    @Test
    public void doesNotFindJumbledQuotedSequence() throws IOException, ParseException {
        assertThat(searchFor("\"good is ham\"", "the ham is good"), isNotFound());
    }

    // todo: fix tag search
    @Test
    @Disabled("Fix me: I want this to work")
    public void doesNotFindNonTag() throws IOException, ParseException {
        assertThat(searchFor("#tags", "The tags are #beef and #chowder"), isNotFound());
    }

    @Test
    public void doesNotFindTagWithTagQuerySyntax() throws IOException, ParseException {
        assertThat(searchFor("tag:#tags", "The tags are #beef and #chowder"), isNotFound());
    }

    @Test
    public void doesNotFindTagWithTagQuerySyntaxBetter() throws IOException, ParseException {
        assertThat(searchFor("tag:tags", "The tags are #beef and #chowder"), isNotFound());
    }

    private Matcher<Collection<? extends SearchResult>> isFound() {
        return is(not(empty()));
    }

    private Matcher<Collection<? extends SearchResult>> isNotFound() {
        return empty();
    }

    private List<SearchResult> searchFor(String query, String text)
            throws IOException, ParseException {
        var analyzer = EnglishWithTagsAnalyzer.create();
        var index = new MemoryIndex();
        index.addField("content", text, analyzer);
        index.addField(EnglishWithTagsAnalyzer.TAG_FIELD, text, analyzer);
        return new Searcher(index.createSearcher(), analyzer).search(query);
    }
}
