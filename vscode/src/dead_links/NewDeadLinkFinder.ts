import _path = require('path');

import { NoteLinkIndex } from "../index/noteLinkIndex";

export class Link {
  constructor(
    public sourcePath: string,
    public targetPath: string) {}
}

export class NewDeadLinkFinder {
  constructor(private linkIndex: NoteLinkIndex) {}

  public findAllDeadLinks = (): Link[] => {
    const deadLinks = [];

    for (const file of this.linkIndex.files()) {
      for (const link of this.linkIndex.linksFrom(file)) {
        const absLinkPath = toAbsolutePath(file, link);
        if (!this.linkIndex.containsFile(absLinkPath)) {
          deadLinks.push(new Link(file, link));
        }
      }
    }

    return deadLinks;
  };
}

function toAbsolutePath(sourcePath: string, linkPath: string) {
  if (linkPath.startsWith('/')) { return linkPath; }

  const absLinkPath = _path.join(_path.dirname(sourcePath), linkPath);

  // don't care about windows for now
  return absLinkPath.replace(/\\/g, '/');
};
