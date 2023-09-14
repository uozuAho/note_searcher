import * as vscode from 'vscode';

import { createMultiIndex } from './index/MultiIndex';
import { VsCodeNoteSearcherUi } from './ui/VsCodeNoteSearcherUi';
import { NoteSearcher } from './note_searcher/noteSearcher';
import { NoteSearcherConfigProvider } from './note_searcher/NoteSearcherConfigProvider';
import { TagCompleter } from './tag_completion/TagCompleter';
import { WikiLinkDefinitionProvider } from './definition_provider/WikiLinkDefinitionProvider';
import { NoteLocator } from './definition_provider/NoteLocator';

export const extensionId = 'uozuaho.note-searcher';

export async function activate(context: vscode.ExtensionContext) {
  const ui = new VsCodeNoteSearcherUi();
  const configProvider = new NoteSearcherConfigProvider(context);
  const multiIndex = createMultiIndex();
  const noteSearcher = new NoteSearcher(ui, multiIndex, configProvider);
  const noteLocator = new NoteLocator(multiIndex);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'noteSearcher.search', async () => await noteSearcher.promptAndSearch()),
    vscode.commands.registerCommand(
      'noteSearcher.searchForTag', async (tag: string) => await noteSearcher.search('#' + tag)),
    vscode.commands.registerCommand(
      'noteSearcher.index', async () => await noteSearcher.index()),
    vscode.commands.registerCommand(
      'noteSearcher.openFile', uri => vscode.window.showTextDocument(uri)),
    vscode.commands.registerCommand(
      'noteSearcher.explorer.copyWikiLink',
      item => noteSearcher.wikiLinkToClipboard(item.fsPath)),
    vscode.commands.registerCommand(
      'noteSearcher.searchResults.copyMarkdownLink',
      searchResult => noteSearcher.markdownLinkToClipboard(searchResult.uri.fsPath)),
    vscode.commands.registerCommand(
      'noteSearcher.searchResults.copyWikiLink',
      searchResult => noteSearcher.wikiLinkToClipboard(searchResult.uri.fsPath)),
    vscode.commands.registerCommand(
      'noteSearcher.editorTab.copyMarkdownLink',
      uri => noteSearcher.markdownLinkToClipboard(uri.fsPath)),
    vscode.commands.registerCommand(
      'noteSearcher.editorTab.copyWikiLink',
      uri => noteSearcher.wikiLinkToClipboard(uri.fsPath)),
    vscode.commands.registerCommand(
      'noteSearcher.createNote', () => noteSearcher.createNote()),

    vscode.languages.registerCompletionItemProvider(['markdown', 'plaintext'],
      new TagCompleter(multiIndex), '#'),

    vscode.languages.registerDefinitionProvider(['markdown', 'plaintext'],
      new WikiLinkDefinitionProvider(noteLocator)),

    ui.createNoteSavedHandler(),
    ui.createMovedViewToDifferentNoteHandler()
  );

  await noteSearcher.notifyExtensionActivated();
}

export function deactivate() {}
