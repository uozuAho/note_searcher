// const asdf = require('path');

import { DirWalker } from "./utils/dirWalker";

export interface DeadLinkFinder {
  findDeadLinks: (rootPath: string) => DeadLink[]
}

export class DeadLink {
  constructor(
    public sourcePath: string,
    public sourceLine: number,
    public targetPath: string) {}
}

// export const createDeadLinkFinder = (): DeadLinkFinder => {
//   return new DeadLinkFinderImpl();
// };

export class DeadLinkFinderImpl implements DeadLinkFinder {
  constructor(private dirWalker: DirWalker) {}

  public findDeadLinks = (rootPath: string) => {
    return [new DeadLink('asdf', 3, 'qwer')];
  };
}
