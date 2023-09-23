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
    const links = this._notesByAbsPath.get(path)?.outgoingLinks || [];
    return Array.from(links);
  }

  public linksTo = (path: string): string[] => {
    const links =  this._notesByAbsPath.get(path)?.incomingLinks || [];
    return Array.from(links);
  };

  public findAllDeadLinks(): Link[] {
    const deadLinks = [];
    for (const [source, note] of this._notesByAbsPath) {
      for (const dest of note.outgoingLinks) {
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
      .forEach(link => note.outgoingLinks.add(link));

    extractWikiLinks(text)
      .forEach(link => note.outgoingWikiLinkFilenames.push(link as string));
  };

  public finalise = () => {
    this.populateOutgoingWikiLinks();
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
  }

  private populateBacklinks = () => {
    for (const [sourcePath, sourceNote] of this._notesByAbsPath) {
      for (const targetPath of sourceNote.outgoingLinks) {
        this._notesByAbsPath.get(targetPath)?.incomingLinks.add(sourcePath);
      }
    }
  };

  private populateOutgoingWikiLinks() {
    for (const [_, note] of this._notesByAbsPath) {
      note.outgoingWikiLinkFilenames
        .map(filename => this._absPathsByFilename.get(filename))
        .filter(absPath => !!absPath)
        .forEach(links => {
          if (links) {
            for (const link of links) {
              note.outgoingLinks.add(link as string);
            }
          }
        });
    }
  }
}

class Note {
  constructor(
    public incomingLinks: GoodSet<string> = new GoodSet(),
    public outgoingWikiLinkFilenames: string[] = [],
    public outgoingLinks: GoodSet<string> = new GoodSet()
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
