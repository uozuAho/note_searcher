import { extractLinks } from "../text_processing/linkExtractor";

export interface NoteLinkIndex {
  notes(): IterableIterator<string>;
  containsNote(path: string): boolean;
  linksFrom(path: string): string[];
}

export class MapLinkIndex implements NoteLinkIndex {
  private _linksFrom: Map<string, string[]>;

  constructor() {
    this._linksFrom = new Map();
  };

  public clear = () => {
    this._linksFrom = new Map();
  };

  public notes = () => {
    return this._linksFrom.keys();
  };

  public containsNote = (path: string) => {
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
