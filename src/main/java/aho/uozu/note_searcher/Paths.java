package aho.uozu.note_searcher;

import java.net.URISyntaxException;
import java.nio.file.Path;

public class Paths {
    public static Path indexPath() throws URISyntaxException {
        return java.nio.file.Paths.get(jarPath().toString(), "index");
    }

    private static Path jarPath() throws URISyntaxException {
        return java.nio.file.Paths.get(Main.class.getProtectionDomain().getCodeSource().getLocation().toURI()).getParent();
    }
}
