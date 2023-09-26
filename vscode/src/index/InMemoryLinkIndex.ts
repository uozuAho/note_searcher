const _path = require('path');

import { extractMarkdownLinks } from "../text_processing/mdLinkExtractor";
import { extractWikiLinks } from "../text_processing/wikiLinkExtractor";
import { GoodSet } from "../utils/goodSet";
import { Link, LinkIndex } from "./LinkIndex";
import { NoteIndex } from "./NoteIndex";

export class InMemoryLinkIndex implements LinkIndex, NoteIndex {
  private _notesByAbsPath: Map<string, Note>;
  private _absPathsByFilename: Map<string, string[]>;

  constructor() {
    this._notesByAbsPath = new Map();
    this._absPathsByFilename = new Map();
  }

  public filenameToAbsPath(filename: string): string[] {
    return this._absPathsByFilename.get(filename) || [];
  }

  public clear = () => {
    this._notesByAbsPath = new Map();
    this._absPathsByFilename = new Map();
  };

  public notes = () => {
    return this._notesByAbsPath.keys();
  };

  public containsNote = (absPathOrFilename: string) => {
    return this._notesByAbsPath.has(absPathOrFilename)
        || this._absPathsByFilename.has(absPathOrFilename);
  };

  public linksFrom(path: string): string[] {
    const note = this._notesByAbsPath.get(path);
    if (!note) { return []; }

    const wikiLinks = Array.from(note.outgoingWikiLinkFilenames)
      .map(filename => this._absPathsByFilename.get(filename))
      .filter(absPath => !!absPath)
      .flat() as string[];

    return [...wikiLinks, ...note.outgoingMdLinks];
  }

  public linksTo = (path: string): string[] => {
    const links =  this._notesByAbsPath.get(path)?.incomingLinks || [];
    return Array.from(links);
  };

  public findAllDeadLinks(): Link[] {
    const deadLinks = [];
    for (const [source, note] of this._notesByAbsPath) {
      const outgoingLinks = this.linksFrom(source);
      for (const dest of outgoingLinks) {
        if (!this.containsNote(dest)) {
          deadLinks.push(new Link(source, dest));
        }
      }
      for (const filename of note.outgoingWikiLinkFilenames) {
        if (!this._absPathsByFilename.has(filename)) {
          deadLinks.push(new Link(source, filename));
        }
      }
    }
    return deadLinks;
  }

  /** Note: remember to call finalise after all files are added. */
  public addFile = (absPath: string, text: string) => {
    const note = this._notesByAbsPath.get(absPath) || new Note();
    const filename = _path.parse(absPath).name;
    this._notesByAbsPath.set(absPath, note);

    if (!this._absPathsByFilename.has(filename)) {
      this._absPathsByFilename.set(filename, [absPath]);
    } else {
      this._absPathsByFilename.get(filename)?.push(absPath);
    }

    extractMarkdownLinks(text)
      .filter(link => !link.startsWith('http'))
      .filter(link => isANote(link))
      .map(link => toAbsolutePath(absPath, link))
      .forEach(link => note.outgoingMdLinks.add(link));

    extractWikiLinks(text)
      .forEach(link => note.outgoingWikiLinkFilenames.add(link as string));
  };

  public finalise = () => {
    this.populateBacklinks();
  };

  public onFileModified = (absPath: string, text: string) => {
    const note = this._notesByAbsPath.set(absPath, new Note());
    for (const note of this._notesByAbsPath.values()) {
      note.incomingLinks.delete(absPath);
    }
    if (!note) { throw new Error(`Note not found: ${absPath}`); }
    this.addFile(absPath, text);
    this.finalise();
  };

  public onFileDeleted(absPath: string) {
    this._notesByAbsPath.delete(absPath);
    for (const note of this._notesByAbsPath.values()) {
      note.incomingLinks.delete(absPath);
    }

    const filename = _path.parse(absPath).name;
    const absPaths = this._absPathsByFilename.get(filename);
    if (absPaths) {
      const newAbsPaths = absPaths.filter(path => path !== absPath);
      if (newAbsPaths.length === 0) {
        this._absPathsByFilename.delete(filename);
      } else {
        this._absPathsByFilename.set(filename, newAbsPaths);
      }
    }
  }

  private populateBacklinks = () => {
    for (const [sourcePath, sourceNote] of this._notesByAbsPath) {
      const outgoingLinks = this.linksFrom(sourcePath);
      for (const targetPath of outgoingLinks) {
        this._notesByAbsPath.get(targetPath)?.incomingLinks.add(sourcePath);
      }
    }
  };
}

class Note {
  constructor(
    public incomingLinks: GoodSet<string> = new GoodSet(),
    public outgoingWikiLinkFilenames: GoodSet<string> = new GoodSet(),
    public outgoingMdLinks: GoodSet<string> = new GoodSet(),
  ) {}
}

function toAbsolutePath(source: string, target: string): string {
  return _path.resolve(_path.dirname(source), target);
}

function isANote(path: string): boolean {
  for (const ext of ['md', 'txt', 'log']) {
    if (path.endsWith(ext)) {
      return true;
    }
  }
  return false;
};
