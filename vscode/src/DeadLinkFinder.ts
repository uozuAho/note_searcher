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
    const allFiles = this.dirWalker.allFilesUnderPath(rootPath);

    for (const path of allFiles) {
      if (!DeadLinkFinder.shouldCheckFile(path)) { continue; }

      const links = this.extractLinksFromFile(path);
      for (const link of links) {
        if (!this.fileReader.exists(link)) {
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
