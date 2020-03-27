package aho.uozu.note_searcher;

import aho.uozu.note_searcher.analysis.EnglishWithTagsAnalyzer;
import org.apache.lucene.index.memory.MemoryIndex;
import org.apache.lucene.queryparser.classic.ParseException;
import org.hamcrest.Matcher;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

// see https://lucene.apache.org/core/8_0_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description
// for query syntax
public class SearcherTests {
    @Test
    public void findsSingleWord() throws IOException, ParseException {
        assertThat(searchFor("ham", "the ham is good"), isFound());
    }

    @Test
    public void doesNotFindMissingWord() throws IOException, ParseException {
        assertThat(searchFor("pizza", "the ham is good"), isNotFound());
    }

    @Test
    public void findsStemmedWord() throws IOException, ParseException {
        assertThat(searchFor("bike", "I own several bikes"), isFound());
    }

    @Nested
    class OrOperator {
        @Test
        public void isDefault() throws IOException, ParseException {
            assertThat(searchFor("ham good", "the ham is good"), isFound());
            assertThat(searchFor("ham or good", "the ham is good"), isFound());
        }

        @Test
        public void findsAtLeastOnePresentWord() throws IOException, ParseException {
            assertThat(searchFor("ham jabberwocky turtle house cannon", "the ham is good"), isFound());
        }
    }

    @Nested
    class AndOperator {
        @Test
        public void findsMultipleWords() throws IOException, ParseException {
            assertThat(searchFor("ham AND good", "the ham is good"), isFound());
        }

        @Test
        public void rejectsAnyMissingWords() throws IOException, ParseException {
            assertThat(searchFor("ham AND pizza", "the ham is good"), isNotFound());
        }

        @Test
        public void isCaseSensitive() throws IOException, ParseException {
            // this is the same as ham OR and OR pizza
            assertThat(searchFor("ham and pizza", "the ham is good"), isFound());
        }
    }

    @Nested
    class PlusOperator {
        @Test
        public void findsMultipleWords() throws IOException, ParseException {
            assertThat(searchFor("+ham +good", "the ham is good"), isFound());
        }

        @Test
        public void doesNotFindMissingWord() throws IOException, ParseException {
            assertThat(searchFor("+pizza", "the ham is good"), isNotFound());
        }
    }

    @Nested
    class NotOperator {
        @Test
        public void findsWord_whenExcludedWordIsMissing() throws IOException, ParseException {
            assertThat(searchFor("ham -pizza", "the ham is good"), isFound());
        }

        @Test
        public void doesNotFind_whenExcludedWordIsPresent() throws IOException, ParseException {
            assertThat(searchFor("ham -good", "the ham is good"), isNotFound());
        }
    }

    @Nested
    class Phrases {
        @Test
        public void work() throws IOException, ParseException {
            assertThat(searchFor("\"ham is good\"", "the ham is good"), isFound());
        }

        @Test
        public void orderIsRespected() throws IOException, ParseException {
            assertThat(searchFor("\"good is ham\"", "the ham is good"), isNotFound());
        }
    }

    @Nested
    class Tags {
        @Test
        public void findsSingle() throws IOException, ParseException {
            assertThat(searchFor("#beef", "The tags are #beef and #chowder"), isFound());
        }

        @Test
        public void findsMultiple() throws IOException, ParseException {
            assertThat(searchFor("#beef #chowder", "The tags are #beef and #chowder"), isFound());
        }

        @Test
        public void operatorsWork() throws IOException, ParseException {
            assertThat(searchFor("#beef -#chowder", "The tags are #beef and #chowder"), isNotFound());
        }

        @Test
        public void doesNotFindMissingTag() throws IOException, ParseException {
            assertThat(searchFor("#alkidsjf", "The tags are #beef and #chowder"), isNotFound());
        }

        @Test
        public void doesNotFindNonTag() throws IOException, ParseException {
            assertThat(searchFor("#tags", "The tags are #beef and #chowder"), isNotFound());
        }
    }

    @Nested
    class TagQueryExpander {
        @Test
        public void replacesTag_atStartOfLine() {
            assertThat(Searcher.replaceTagShortcuts("#tag"), equalTo("tag:#tag"));
        }

        @Test
        public void replacesTag_inMiddleOfLine() {
            assertThat(Searcher.replaceTagShortcuts("hello #tag boy"), equalTo("hello tag:#tag boy"));
        }

        @Test
        public void doesNotModifyLuceneTagQuery() {
            assertThat(Searcher.replaceTagShortcuts("tag:#thing"), equalTo("tag:#thing"));
        }
    }

    // These tests demonstrate lucene classic query parser behaviour for searching for tags.
    // I don't really care - the above queries are easier.
    @Nested
    class LuceneQuerySyntaxForTags {
        @Test
        public void luceneQuerySyntaxWorks() throws IOException, ParseException {
            assertThat(searchFor("tag:#beef", "The tags are #beef and #chowder"), isFound());
        }

        @Test
        public void doesNotFindNonTagWithTagQuerySyntax() throws IOException, ParseException {
            assertThat(searchFor("tag:#tags", "The tags are #beef and #chowder"), isNotFound());
        }

        @Test
        @Disabled("Fix me: This is probably how it should work, but meh")
        public void intendedLuceneQuerySyntaxWorks() throws IOException, ParseException {
            assertThat(searchFor("tag:beef", "The tags are #beef and #chowder"), isFound());
        }
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
