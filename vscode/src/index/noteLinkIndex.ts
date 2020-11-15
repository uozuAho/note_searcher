const _path = require('path');

import { extractMarkdownLinks } from "../text_processing/mdLinkExtractor";
import { GoodSet } from "../utils/goodSet";

/** All paths are absolute unless mentioned otherwise */
export interface NoteLinkIndex {
  notes(): IterableIterator<string>;
  containsNote(path: string): boolean;
  /** returns link text of all markdown links (not necessarily abs paths) */
  markdownLinksFrom(path: string): string[];
  /** returns link text of all wiki links (should be filenames only) */
  wikiLinksFrom(path: string): string[]
  linksTo(path: string): string[];
}

export class MapLinkIndex implements NoteLinkIndex {
  private _markdownLinksFrom: Map<string, string[]>;
  private _wikiLinksFrom: Map<string, string[]>;
  private _linksTo: Map<string, GoodSet<string>>;

  constructor() {
    this._markdownLinksFrom = new Map();
    this._wikiLinksFrom = new Map();
    this._linksTo = new Map();
  };

  public clear = () => {
    this._markdownLinksFrom = new Map();
  };

  public notes = () => {
    return this._markdownLinksFrom.keys();
  };

  public containsNote = (path: string) => {
    return this._markdownLinksFrom.has(path);
  };

  public markdownLinksFrom = (path: string): string[] => {
    return this._markdownLinksFrom.get(path) || [];
  };

  public wikiLinksFrom(path: string): string[] {
    return this._wikiLinksFrom.get(path) || [];
  }

  public linksTo = (path: string): string[] => {
    const links = this._linksTo.get(path);
    if (!links) { return []; }
    return Array.from(links);
  };

  public addFile = (absPath: string, text: string) => {
    const links = extractMarkdownLinks(text).filter(link => !link.startsWith('http'));
    this.addForwardLinks(absPath, links);
    this.addBackwardLinks(absPath, links);
  };

  private addForwardLinks(absPath: string, targetPaths: string[]) {
    const existingLinks = this._markdownLinksFrom.get(absPath);
    if (existingLinks) {
      targetPaths.forEach(t => existingLinks.push(t));
    } else {
      this._markdownLinksFrom.set(absPath, targetPaths);
    }
  }

  private addBackwardLinks(absPath: string, targetPaths: string[]) {
    const absTargetPaths = targetPaths.map(t => toAbsolutePath(absPath, t));
    for (const absTargetPath of absTargetPaths) {
      const existingLinks = this._linksTo.get(absTargetPath);
      if (existingLinks) {
        existingLinks.add(absPath);
      } else {
        this._linksTo.set(absTargetPath, new GoodSet([absPath]));
      }
    }
  }
}

function toAbsolutePath(source: string, target: string) {
  return _path.resolve(_path.dirname(source), target);
}
