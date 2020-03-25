package aho.uozu.note_searcher.analysis;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.analysis.miscellaneous.PerFieldAnalyzerWrapper;

import java.util.Map;

public class EnglishWithTagsAnalyzer {
    public static final String CONTENT_FIELD = "content";
    public static final String TAG_FIELD = "tag";

    public static Analyzer create() {
        final Analyzer tagsAnalyzer = new TagsAnalyzer();
        final Analyzer englishAnalyzer = new EnglishAnalyzer();
        final Map<String, Analyzer> fieldAnalyzers = Map.of(TAG_FIELD, tagsAnalyzer);

        return new PerFieldAnalyzerWrapper(englishAnalyzer, fieldAnalyzers);
    }
}
