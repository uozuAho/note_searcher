import * as vscode from 'vscode';

import { NoteLinkIndex } from './index/noteLinkIndex';

// A DefinitionProvider provides 'go to definition' behaviour
// https://code.visualstudio.com/api/references/vscode-api?source=post_page-----94656da18431----------------------#DefinitionProvider
export class MarkdownDefinitionProvider implements vscode.DefinitionProvider {

  constructor(private noteIndex: NoteLinkIndex) {}

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ) {
    const ref = getRefAt(document, position);
    if (ref.type != RefType.WikiLink) {
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

export function getRefAt(document: vscode.TextDocument, position: vscode.Position): Ref {
  let ref: string;
  let regex: RegExp;
  let range: vscode.Range | undefined;

  // const _rxWikiLink = '\\[\\[[^sep\\]]+(sep[^sep\\]]+)?\\]\\]';
  const _rxWikiLink = '\\[\\[[^\\|\\]]+(\\|[^\\|\\]]+)?\\]\\]';

  regex = new RegExp(_rxWikiLink, 'gi');
  range = document.getWordRangeAtPosition(position, regex);
  if (range) {
    // Our rxWikiLink contains [[ and ]] chars
    // but the replacement words do NOT.
    // So, account for the (exactly) 2 [[  chars at beginning of the match
    // since our replacement words do not contain [[ chars
    let s = new vscode.Position(range.start.line, range.start.character + 2);
    // And, account for the (exactly) 2 ]]  chars at beginning of the match
    // since our replacement words do not contain ]] chars
    let e = new vscode.Position(range.end.line, range.end.character - 2);
    // keep the end
    let r = new vscode.Range(s, e);
    ref = document.getText(r);
    if (ref) {
      // Check for piped wiki-links
      ref = NoteWorkspace.cleanPipedWikiLink(ref);

      return {
        type: RefType.WikiLink,
        word: ref, // .replace(/^\[+/, ''),
        hasExtension: refHasExtension(ref),
        range: r, // range,
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
