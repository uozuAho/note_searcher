const _path = require('path');

import { extractMarkdownLinks } from "../text_processing/mdLinkExtractor";
import { extractWikiLinks } from "../text_processing/wikiLinkExtractor";
import { GoodSet } from "../utils/goodSet";

export interface NoteLinkIndex {
  /** absolute path of each note in the index */
  notes(): IterableIterator<string>;

  containsNote(absPathOrFilename: string): boolean;

  /** returns note paths linked from the given note */
  linksFrom(absPath: string): string[]

  /** returns all notes (abs paths) containing links to the given note */
  linksTo(path: string): string[];
}

export class MapLinkIndex implements NoteLinkIndex {
  private _notesByAbsPath: Map<string, Note>;
  private _absPathsByFilename: Map<string, string>;

  constructor() {
    this._notesByAbsPath = new Map();
    this._absPathsByFilename = new Map();
  };

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

  private markdownLinksFrom = (path: string): string[] => {
    return this._notesByAbsPath.get(path)?.outgoingMarkdownLinks || [];
  };

  private wikiLinksFrom(path: string): string[] {
    const links = this._notesByAbsPath.get(path)?.outgoingWikiLinks || [];
    return Array.from(links);
  }

  public linksFrom(path: string): string[] {
    // const mdLinks = this
    //   .markdownLinksFrom(path)
    //   .map(relPath => toAbsolutePath(path, relPath));

    // const wikiLinks = this
    //   .wikiLinksFrom(path)
    //   .map(filename => this._absPathsByFilename.get(filename))
    //   .filter(absPath => !!absPath) as string[];

    // return mdLinks.concat(wikiLinks);
    const links = this._notesByAbsPath.get(path)?.outgoingLinks || [];
    return Array.from(links);
  }

  public linksTo = (path: string): string[] => {
    const links =  this._notesByAbsPath.get(path)?.incomingLinks || [];
    return Array.from(links);
  };

  /** Note: remember to call finalise after all files are added.
   */
  public addFile = (absPath: string, text: string) => {
    const note = this._notesByAbsPath.get(absPath) || new Note();
    const filename = _path.parse(absPath).name;
    this._notesByAbsPath.set(absPath, note);
    this._absPathsByFilename.set(filename, absPath);

    extractMarkdownLinks(text)
      .filter(link => !link.startsWith('http'))
      .map(link => toAbsolutePath(absPath, link))
      .forEach(link => note.outgoingLinks.add(link));

    // Temporarily store wikilink targets as filenames.
    // These will be converted to absolute paths on finalise().
    extractWikiLinks(text)
      .forEach(link => note.outgoingWikiLinks.push(link as string));
      // .map(filename => this._absPathsByFilename.get(filename))
      // .filter(path => !!path)
  };

  public finalise = () => {
    for (const [_, note] of this._notesByAbsPath) {
      note.outgoingWikiLinks
        .map(filename => this._absPathsByFilename.get(filename))
        .filter(absPath => !!absPath)
        .forEach(link => note.outgoingLinks.add(link as string))
    }

    this.buildBacklinkIndex();
  }

  /** Builds backlink index from existing note index. Call after all notes are
   *  added.
   */
  private buildBacklinkIndex = () => {
    for (const [sourcePath, sourceNote] of this._notesByAbsPath) {
      for (const targetPath of sourceNote.outgoingLinks) {
        this._notesByAbsPath.get(targetPath)?.incomingLinks.add(sourcePath);
      }
      for (const targetPath of sourceNote.outgoingMarkdownLinks) {
        const absLinkTarget = toAbsolutePath(sourcePath, targetPath);
        this._notesByAbsPath.get(absLinkTarget)?.incomingLinks.add(sourcePath);
      }
      for (const targetFilename of sourceNote.outgoingWikiLinks) {
        const absPath = this._absPathsByFilename.get(targetFilename);
        if (!absPath) { continue; }
        this._notesByAbsPath.get(absPath)?.incomingLinks.add(sourcePath);
      }
    }
  };
}

class Note {
  constructor(
    public incomingLinks: GoodSet<string> = new GoodSet(),
    public outgoingWikiLinks: string[] = [],
    public outgoingMarkdownLinks: string[] = [],
    public outgoingLinks: GoodSet<string> = new GoodSet()
  ) {}
}

function toAbsolutePath(source: string, target: string): string {
  return _path.resolve(_path.dirname(source), target);
}
