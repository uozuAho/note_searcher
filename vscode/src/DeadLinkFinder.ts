import { DirWalker } from "./utils/dirWalker";
import { FileReader } from "./utils/FileReader";
import { extractLinks } from "./text_processing/LinkExtractor";

export class DeadLink {
  constructor(
    public sourcePath: string,
    public targetPath: string) {}
}

export class DeadLinkFinder {
  constructor(private dirWalker: DirWalker, private fileReader: FileReader) {}

  public findDeadLinks = (rootPath: string) => {
    const deadLinks = [];
    const allFiles = new Set<string>();

    // pass 1: find all files
    for (const path of this.dirWalker.allFilesUnderPath(rootPath)) {
      allFiles.add(path);
    }

    // pass 2: check links
    for (const path of allFiles) {
      if (!DeadLinkFinder.shouldCheckFile(path)) { continue; }

      const links = this.extractLinksFromFile(path);
      for (const link of links) {
        if (!allFiles.has(link)) {
          deadLinks.push(new DeadLink(path, link));
        }
      }
    }

    return deadLinks;
  };

  private extractLinksFromFile = (path: string): string[] => {
    const contents = this.fileReader.readFile(path);
    return extractLinks(contents).filter(link => !link.startsWith('http'));
  };

  private static shouldCheckFile = (path: string) => {
    for (const ext of ['md', 'txt', 'log']) {
      if (path.endsWith(ext)) {
        return true;
      }
    }
    return false;
  };
}
