import * as vscode from 'vscode';

import {
  createSingleWikiLinkRegex,
  extractFilenameFromWikiLink
} from '../text_processing/wikiLinkExtractor';
import { NoteLocator } from './NoteLocator';

// A DefinitionProvider provides 'go to definition' behaviour
// https://code.visualstudio.com/api/references/vscode-api?source=post_page-----94656da18431----------------------#DefinitionProvider
export class VsCodeWikiLinkDefinitionProvider implements vscode.DefinitionProvider {

  constructor(private noteLocator: NoteLocator) {}

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

    return this.noteLocator
      .locateNote(filename)
      .map(path => new vscode.Location(vscode.Uri.file(path), startOfDocument));
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
