export interface LinkIndex {
  /** returns note paths linked from the given note */
  linksFrom(absPath: string): string[];

  /** returns all notes (abs paths) containing links to the given note */
  linksTo(path: string): string[];

  findAllDeadLinks(): Link[];
}

export class Link {
  constructor(
    public sourcePath: string,
    public targetPath: string) {}
}
