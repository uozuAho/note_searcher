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
      for (const link of this.linkIndex.linksFrom(file)) {
        const absLinkPath = toAbsolutePath(file, link);
        if (!this.fileSystem.fileExists(absLinkPath)) {
          deadLinks.push(new Link(file, link));
        }
      }
    }

    return deadLinks;
  };
}

function toAbsolutePath(sourcePath: string, linkPath: string) {
  return _path.resolve(_path.dirname(sourcePath), linkPath);
};
