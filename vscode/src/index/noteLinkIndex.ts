import { extractLinks } from "../text_processing/linkExtractor";

export interface NoteLinkIndex {
  files(): IterableIterator<string>;
  containsFile(path: string): boolean;
  linksFrom(path: string): string[];
}

export class MapLinkIndex implements NoteLinkIndex {
  private _linksFrom: Map<string, string[]>;

  constructor() {
    this._linksFrom = new Map();
  };

  public reset = () => {
    this._linksFrom = new Map();
  };

  public files = () => {
    return this._linksFrom.keys();
  };

  public containsFile = (path: string) => {
    return this._linksFrom.has(path);
  };

  public linksFrom = (path: string): string[] => {
    return this._linksFrom.get(path) || [];
  };

  public addFile = (absPath: string, text: string) => {
    const links = extractLinks(text).filter(link => !link.startsWith('http'));
    this.addLinks(absPath, links);
  };

  private addLinks(absPath: string, targetPaths: string[]) {
    const existingLinks = this._linksFrom.get(absPath);
    if (existingLinks) {
      targetPaths.forEach(t => existingLinks.push(t));
    } else {
      this._linksFrom.set(absPath, targetPaths);
    }
  }
}
