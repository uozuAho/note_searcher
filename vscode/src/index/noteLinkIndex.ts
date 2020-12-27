const _path = require('path');

import { extractMarkdownLinks } from "../text_processing/mdLinkExtractor";
import { extractWikiLinks } from "../text_processing/wikiLinkExtractor";
import { GoodSet } from "../utils/goodSet";

export interface NoteLinkIndex {
  /** absolute path of each note in the index */
  notes(): IterableIterator<string>;

  containsNote(absPathOrFilename: string): boolean;

  /** returns link text of all markdown links (not necessarily abs paths) */
  markdownLinksFrom(absPath: string): string[];

  /** returns link text of all wiki links (filenames only) */
  wikiLinksFrom(absPath: string): string[]

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

  public markdownLinksFrom = (path: string): string[] => {
    return this._notesByAbsPath.get(path)?.outgoingMarkdownLinks || [];
  };

  public wikiLinksFrom(path: string): string[] {
    return this._notesByAbsPath.get(path)?.outgoingWikiLinks || [];
  }

  public linksFrom(path: string): string[] {
    const mdLinks = this
      .markdownLinksFrom(path)
      .map(relPath => toAbsolutePath(path, relPath));

    const wikiLinks = this
      .wikiLinksFrom(path)
      .map(filename => this._absPathsByFilename.get(filename))
      .filter(absPath => !!absPath) as string[];

    return mdLinks.concat(wikiLinks);
  }

  public linksTo = (path: string): string[] => {
    const links =  this._notesByAbsPath.get(path)?.incomingLinks || [];
    return Array.from(links);
  };

  /** Note: remember to call buildBacklinkIndex after all files are added, or
   *  backlinks will not work.
   */
  public addFile = (absPath: string, text: string) => {
    const note = this._notesByAbsPath.get(absPath) || new Note();
    const filename = _path.parse(absPath).name;
    this._notesByAbsPath.set(absPath, note);
    this._absPathsByFilename.set(filename, absPath);

    note.outgoingMarkdownLinks = extractMarkdownLinks(text).filter(link => !link.startsWith('http'));
    note.outgoingWikiLinks = extractWikiLinks(text);
  };

  /** Builds backlink index from existing note index. Call after all notes are
   *  added.
   */
  public buildBacklinkIndex = () => {
    for (const [sourcePath, sourceNote] of this._notesByAbsPath) {
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
    public outgoingMarkdownLinks: string[] = []
  ) {}
}

function toAbsolutePath(source: string, target: string): string {
  return _path.resolve(_path.dirname(source), target);
}
