const _path = require('path');

import { extractMarkdownLinks } from "../text_processing/mdLinkExtractor";
import { extractWikiLinks } from "../text_processing/wikiLinkExtractor";
import { GoodSet } from "../utils/goodSet";

export interface NoteLinkIndex {
  notes(): IterableIterator<string>;

  containsNote(absPathOrFilename: string): boolean;

  /** returns link text of all markdown links (not necessarily abs paths) */
  markdownLinksFrom(absPath: string): string[];

  /** returns link text of all wiki links (should be filenames only) */
  wikiLinksFrom(absPath: string): string[]

  linksTo(path: string): string[];
}

export class MapLinkIndex implements NoteLinkIndex {
  private _markdownLinksFrom: Map<string, string[]>;
  private _wikiLinksFrom: Map<string, string[]>;
  private _linksTo: Map<string, GoodSet<string>>;
  private _noteFilenames: Set<string>;

  constructor() {
    this._markdownLinksFrom = new Map();
    this._wikiLinksFrom = new Map();
    this._linksTo = new Map();
    this._noteFilenames = new Set();
  };

  public clear = () => {
    this._markdownLinksFrom = new Map();
    this._wikiLinksFrom = new Map();
  };

  public notes = () => {
    return this._markdownLinksFrom.keys();
  };

  public containsNote = (absPathOrFilename: string) => {
    return this._markdownLinksFrom.has(absPathOrFilename)
        || this._noteFilenames.has(absPathOrFilename);
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
    this._noteFilenames.add(_path.parse(absPath).name);

    const markdownLinks = extractMarkdownLinks(text).filter(link => !link.startsWith('http'));
    const wikiLinks = extractWikiLinks(text);
    this.addForwardMarkdownLinks(absPath, markdownLinks);
    this.addForwardWikiLinks(absPath, wikiLinks);
    this.addBackwardLinks(absPath, markdownLinks);
  };

  private addForwardMarkdownLinks(absPath: string, targetPaths: string[]) {
    const existingLinks = this._markdownLinksFrom.get(absPath);
    if (existingLinks) {
      targetPaths.forEach(t => existingLinks.push(t));
    } else {
      this._markdownLinksFrom.set(absPath, targetPaths);
    }
  }

  private addForwardWikiLinks(absPath: string, links: string[]) {
    const existingLinks = this._wikiLinksFrom.get(absPath);
    if (existingLinks) {
      links.forEach(t => existingLinks.push(t));
    } else {
      this._wikiLinksFrom.set(absPath, links);
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
