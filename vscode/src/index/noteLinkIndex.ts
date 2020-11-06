const _path = require('path');

import { extractLinks } from "../text_processing/linkExtractor";
import { GoodSet } from "../utils/goodSet";

// all paths are absolute
export interface NoteLinkIndex {
  // abs path of every indexed note
  notes(): IterableIterator<string>;
  containsNote(path: string): boolean;
  linksFrom(path: string): string[];
  linksTo(path: string): string[];
}

export class MapLinkIndex implements NoteLinkIndex {
  private _linksFrom: Map<string, string[]>;
  private _linksTo: Map<string, GoodSet<string>>;

  constructor() {
    this._linksFrom = new Map();
    this._linksTo = new Map();
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

  public linksTo = (path: string): string[] => {
    const links = this._linksTo.get(path);
    if (!links) { return []; }
    return Array.from(links);
  };

  public addFile = (absPath: string, text: string) => {
    const links = extractLinks(text).filter(link => !link.startsWith('http'));
    this.addForwardLinks(absPath, links);
    this.addBackwardLinks(absPath, links);
  };

  private addForwardLinks(absPath: string, targetPaths: string[]) {
    const existingLinks = this._linksFrom.get(absPath);
    if (existingLinks) {
      targetPaths.forEach(t => existingLinks.push(t));
    } else {
      this._linksFrom.set(absPath, targetPaths);
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
