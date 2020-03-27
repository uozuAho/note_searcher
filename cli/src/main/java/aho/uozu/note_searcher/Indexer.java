package aho.uozu.note_searcher;

import aho.uozu.note_searcher.analysis.EnglishWithTagsAnalyzer;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.store.FSDirectory;

import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Date;

/**
 * Mostly copied from https://github.com/apache/lucene-solr/blob/master/lucene/demo/src/java/org/apache/lucene/demo/IndexFiles.java
 */
class Indexer {
    private final Path _indexPath;
    private final Analyzer _analyzer;

    public Indexer(Path indexPath, Analyzer analyzer) {
        this._indexPath = indexPath;
        this._analyzer = analyzer;
    }

    /** Index all text files under a directory. */
    public void indexDirectory(Path directory, boolean update) throws IOException {
        boolean create = !update;

        if (!Files.isReadable(directory)) {
            System.out.println("Document directory '" +directory.toAbsolutePath()+ "' does not exist or is not readable, please check the path");
            return;
        }

        var start = new Date();
        System.out.println("Scanning '" + directory + "' for files");
        System.out.println("Indexing to directory '" + this._indexPath + "'...");

        var dir = FSDirectory.open(this._indexPath);
        var indexWriterConfig = new IndexWriterConfig(_analyzer);

        if (create) {
            indexWriterConfig.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
        } else {
            indexWriterConfig.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        }

        var writer = new IndexWriter(dir, indexWriterConfig);
        indexDocs(writer, directory);

        writer.close();

        Date end = new Date();
        System.out.println(end.getTime() - start.getTime() + " total milliseconds");
    }

    static void indexDocs(final IndexWriter writer, Path path) throws IOException {
        if (Files.isDirectory(path)) {
            Files.walkFileTree(path, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                    if (!shouldIndexFile(file)) return FileVisitResult.CONTINUE;
                    try {
                        indexDoc(writer, file, attrs.lastModifiedTime().toMillis());
                    } catch (IOException ignore) {
                        // don't index files that can't be read.
                        System.out.println("Couldn't read file: " + file);
                    }
                    return FileVisitResult.CONTINUE;
                }
            });
        } else {
            indexDoc(writer, path, Files.getLastModifiedTime(path).toMillis());
        }
    }

    static boolean shouldIndexFile(Path file) {
        // todo: config for this
        var pathString = file.toString().toLowerCase();
        return pathString.endsWith(".md")
                || pathString.endsWith(".txt")
                || pathString.endsWith(".log");
    }

    static void indexDoc(IndexWriter writer, Path file, long lastModified) throws IOException {
        String contents = new String(Files.readAllBytes(file));
        Document doc = new Document();

        doc.add(new StringField("path", file.toString(), Field.Store.YES));
        doc.add(new LongPoint("modified", lastModified));
        doc.add(new TextField(EnglishWithTagsAnalyzer.CONTENT_FIELD, contents, Field.Store.YES));
        doc.add(new TextField(EnglishWithTagsAnalyzer.TAG_FIELD, contents, Field.Store.NO));

        if (writer.getConfig().getOpenMode() == IndexWriterConfig.OpenMode.CREATE) {
            System.out.println("adding " + file);
            writer.addDocument(doc);
        } else {
            System.out.println("updating " + file);
            writer.updateDocument(new Term("path", file.toString()), doc);
        }
    }
}
