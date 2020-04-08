export interface DeadLinkFinder {
  findDeadLinks: (rootPath: string) => DeadLink[]
}

export class DeadLink {
  constructor(
    public sourcePath: string,
    public sourceLine: number,
    public targetPath: string) {}
}
