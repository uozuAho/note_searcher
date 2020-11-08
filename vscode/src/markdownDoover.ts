import * as vscode from 'vscode';

import { NoteLinkIndex } from './index/noteLinkIndex';

// A DefinitionProvider provides 'go to definition' behaviour
// https://code.visualstudio.com/api/references/vscode-api?source=post_page-----94656da18431----------------------#DefinitionProvider
export class WikiLinkDefinitionProvider implements vscode.DefinitionProvider {

  constructor(private noteIndex: NoteLinkIndex) {}

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ) {
    const ref = getRefAt(document, position);
    if (ref.type !== RefType.WikiLink) {
      return [];
    }

    const pos = new vscode.Position(0, 0);

    return Array
      .from(this.noteIndex.notes())
      .filter(path => path.includes(ref.word))
      .map(path => vscode.Uri.file(path))
      .map(uri => new vscode.Location(uri, pos));
  }
}

const wikiLinkFilenameRegex = RegExp(/\[\[.+?\]\]/gi);

export function findWikiLinkFilename(text: string): string | null {
  const matches = wikiLinkFilenameRegex.exec(text);
  return matches
    ? matches[0]
    : null;
}

export function getRefAt(document: vscode.TextDocument, position: vscode.Position): Ref {
  let ref: string;
  let regex: RegExp;
  let range: vscode.Range | undefined;

  regex = new RegExp(/\[\[.+?\]\]/, 'gi');
  range = document.getWordRangeAtPosition(position, regex);
  if (range) {
    // remove [[ and ]]
    let start = new vscode.Position(range.start.line, range.start.character + 2);
    let end = new vscode.Position(range.end.line, range.end.character - 2);
    let wikiLinkTextRange = new vscode.Range(start, end);
    ref = document.getText(wikiLinkTextRange);
    if (ref) {
      // Check for piped wiki-links
      // ref = NoteWorkspace.cleanPipedWikiLink(ref);

      return {
        type: RefType.WikiLink,
        word: ref, // .replace(/^\[+/, ''),
        hasExtension: false,
        range: wikiLinkTextRange, // range,
      };
    }
  }

  return NULL_REF;
}

export enum RefType {
  Null, // 0
  WikiLink, // 1
  Tag, // 2
}

export interface Ref {
  type: RefType;
  word: string;
  hasExtension: boolean | null;
  range: vscode.Range | undefined;
}

export const debugRef = (ref: Ref) => {
  const { type, word, hasExtension, range } = ref;
  console.debug({
    type: RefType[ref.type],
    word: ref.word,
    hasExtension: ref.hasExtension,
    range: ref.range,
  });
};

export const NULL_REF = {
  type: RefType.Null,
  word: '',
  hasExtension: null,
  range: undefined,
};
