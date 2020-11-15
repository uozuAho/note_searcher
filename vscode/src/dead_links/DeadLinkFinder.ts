import _path = require('path');

import { NoteLinkIndex } from "../index/noteLinkIndex";
import { FileSystem } from '../utils/FileSystem';

export class Link {
  constructor(
    public sourcePath: string,
    public targetPath: string) {}
}

export class DeadLinkFinder {
  constructor(
    private linkIndex: NoteLinkIndex,
    private fileSystem: FileSystem) {}

  public findAllDeadLinks = (): Link[] => {
    const deadLinks = [];

    for (const file of this.linkIndex.notes()) {
      for (const link of this.findDeadMarkdownLinks(file)) {
        deadLinks.push(link);
      }
      for (const link of this.findDeadWikiLinks(file)) {
        deadLinks.push(link);
      }
    }

    return deadLinks;
  };

  private findDeadMarkdownLinks = (fromPath: string) => {
    const deadLinks = [];
    for (const link of this.linkIndex.markdownLinksFrom(fromPath)) {
      const absLinkPath = toAbsolutePath(fromPath, link);
      if (!this.fileSystem.fileExists(absLinkPath)) {
        deadLinks.push(new Link(fromPath, link));
      }
    }
    return deadLinks;
  };

  private findDeadWikiLinks = (fromPath: string) => {
    const deadLinks = [];
    for (const link of this.linkIndex.wikiLinksFrom(fromPath)) {
      if (!this.linkIndex.containsNote(link)) {
        deadLinks.push(new Link(fromPath, link));
      }
    }
    return deadLinks;
  };
}

function toAbsolutePath(sourcePath: string, linkPath: string) {
  return _path.resolve(_path.dirname(sourcePath), linkPath);
};
