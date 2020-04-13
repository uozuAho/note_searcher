import { FileSystem } from "../utils/FileSystem";
import { extractLinks } from "../text_processing/LinkExtractor";
import _path = require('path');

export class DeadLink {
  constructor(
    public sourcePath: string,
    public targetPath: string) {}
}

export class DeadLinkFinder {
  constructor(private fileSystem: FileSystem) {}

  public findDeadLinks = (rootPath: string) => {
    const deadLinks = [];
    const allFiles = this.fileSystem.allFilesUnderPath(rootPath);

    for (const sourceFile of allFiles) {
      if (!this.shouldCheckFile(sourceFile)) { continue; }

      const links = this.extractLinksFromFile(sourceFile);
      for (const link of links) {
        const absLink = this.toAbsolutePath(link, rootPath, sourceFile);
        if (!this.fileSystem.fileExists(absLink)) {
          deadLinks.push(new DeadLink(sourceFile, link));
        }
      }
    }

    return deadLinks;
  };

  private shouldCheckFile = (path: string) => {
    for (const ext of ['md', 'txt', 'log']) {
      if (path.endsWith(ext)) {
        return true;
      }
    }
    return false;
  };

  private extractLinksFromFile = (path: string): string[] => {
    const contents = this.fileSystem.readFile(path);
    return extractLinks(contents).filter(link => !link.startsWith('http'));
  };

  private toAbsolutePath = (link: string, root: string, sourcePath: string) => {
    const platformPath = link.startsWith('/')
      ? _path.join(root, link)
      : _path.join(_path.dirname(sourcePath), link);

    // don't care about windows for now
    return platformPath.replace(/\\/g, '/');
  };
}
