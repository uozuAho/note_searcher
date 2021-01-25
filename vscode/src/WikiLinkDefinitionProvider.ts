import * as vscode from 'vscode';

import { NoteLinkIndex } from "./index/NoteLinkIndex";
import {
  createSingleWikiLinkRegex,
  extractFilenameFromWikiLink
} from './text_processing/wikiLinkExtractor';

// A DefinitionProvider provides 'go to definition' behaviour
// https://code.visualstudio.com/api/references/vscode-api?source=post_page-----94656da18431----------------------#DefinitionProvider
export class WikiLinkDefinitionProvider implements vscode.DefinitionProvider {

  constructor(private noteIndex: NoteLinkIndex) {}

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

    return Array
      .from(this.noteIndex.notes())
      .filter(path => path.includes(filename))
      .map(path => vscode.Uri.file(path))
      .map(uri => new vscode.Location(uri, startOfDocument));
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
