import * as vscode from 'vscode';

import { NoteIndex } from "./index/NoteIndex";
import {
  createSingleWikiLinkRegex,
  extractFilenameFromWikiLink
} from './text_processing/wikiLinkExtractor';

// A DefinitionProvider provides 'go to definition' behaviour
// https://code.visualstudio.com/api/references/vscode-api?source=post_page-----94656da18431----------------------#DefinitionProvider
export class WikiLinkDefinitionProvider implements vscode.DefinitionProvider {

  constructor(private noteIndex: NoteIndex) {}

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ) {
    const filename = getWikilinkFilenameAt(document, position);
    if (!filename) {
      return [];
    }

    const startOfDocument = new vscode.Position(0, 0);

    // exact match
    if (this.noteIndex.containsNote(filename)) {
      let path = this.noteIndex.filenameToAbsPath(filename);

      console.log(`Found exact match for ${filename} at ${path}`);

      if (!path) { return []; }

      return [new vscode.Location(vscode.Uri.file(path), startOfDocument)];
    }

    // else: substring match
    let asdf = Array
      .from(this.noteIndex.notes())
      .filter(path => path.includes(filename))
      .map(path => vscode.Uri.file(path))
      .map(uri => new vscode.Location(uri, startOfDocument));

    console.log(`Found substring matches for ${filename} at ${asdf}`);

    return asdf;
  }
}

function getWikilinkFilenameAt(
  document: vscode.TextDocument,
  position: vscode.Position
): string | null
{
  const regex = createSingleWikiLinkRegex();
  const range = document.getWordRangeAtPosition(position, regex);
  if (!range) {
    return null;
  }

  const text = document.getText(range);

  return extractFilenameFromWikiLink(text);
}
