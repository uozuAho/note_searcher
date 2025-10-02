import * as vscode from 'vscode';
import { SearchResultTree } from './searchResultTree';
import {
  INoteSearcherUi,
  FileChangeListener,
  FileDeletedListener,
  FileMovedListener,
  FileRenamedListener
} from './INoteSearcherUi';
import { IFile } from "../utils/IFile";
import { DeadLinksTree } from './DeadLinksTree';
import { LinksTree } from './LinksTree';
import { TagsTree } from './TagsTree';
import { Link } from '../index/LinkIndex';

export class VsCodeNoteSearcherUi implements INoteSearcherUi {
  private noteSavedListener: FileChangeListener | null = null;
  private noteDeletedListener: FileDeletedListener | null = null;
  private movedViewToDifferentNoteListener: FileChangeListener | null = null;
  private noteMovedListener: FileMovedListener | null = null;

  public openFile(path: any) {
    return vscode.window.showTextDocument(vscode.Uri.file(path));
  }

  public copyToClipboard = async (text: string) => {
    return await vscode.env.clipboard.writeText(text);
  };

  public getCurrentFile = () =>
    vscode.window.activeTextEditor
      ? new VsCodeFile(vscode.window.activeTextEditor.document)
      : null;

  public currentlyOpenDir = () =>
    vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : null;

  public promptForSearch = async (prefill: string) => {
    return await vscode.window.showInputBox({
      value: prefill,
      prompt: "Search for documents"
    });
  };

  public showSearchResults = async (files: string[]) => {
    const uris = files.map(f => vscode.Uri.file(f));
    const searchResults = new SearchResultTree(uris);
    const view = vscode.window.createTreeView('noteSearcher-results', {
      treeDataProvider: searchResults,
    });

    // Hack: Show the view container if it's not currently visible.
    //       Doesn't work if there's no search results :(
    if (uris.length > 0) {
      const children = await searchResults.getChildren();
      return view.reveal(children[0]);
    }
  };

  public promptForNewNoteName = async (noteId: string) => {
    return await vscode.window.showInputBox({
      value: noteId,
      prompt: "Create a new note",
      valueSelection: [noteId.length, noteId.length]
    });
  };

  public startNewNote = async (path: string) => {
    const uri = vscode.Uri.file(path).with({scheme: 'untitled'});
    const doc = await vscode.workspace.openTextDocument(uri);
    const pathSegments = uri.path.split('/');
    const filename = pathSegments[pathSegments.length - 1];
    const heading = filename.replace(/_/g, ' ').replace('.md', '').trim();
    const editor = await vscode.window.showTextDocument(doc);
    await editor.edit(editBuilder => {
      editBuilder.insert(new vscode.Position(0, 0), `# ${heading}\n\n`);
    });
    return;
  };

  public showNotification = async (message: string) => {
    await vscode.window.showInformationMessage(message);
  };

  public showDeadLinks = (links: Link[]) => {
    const deadLinks = new DeadLinksTree(links);

    vscode.window.createTreeView('noteSearcher-deadLinks', {
      treeDataProvider: deadLinks
    });
  };

  public showBacklinks = (links: string[]) => {
    const uris = links.map(l => vscode.Uri.file(l));
    const backlinks = new LinksTree(uris);

    vscode.window.createTreeView('noteSearcher-backlinks', {
      treeDataProvider: backlinks
    });
  };

  public showForwardLinks = (links: string[]) => {
    const uris = links.map(l => vscode.Uri.file(l));
    const backlinks = new LinksTree(uris);

    vscode.window.createTreeView('noteSearcher-forwardLinks', {
      treeDataProvider: backlinks
    });
  };

  public showTags = (tags: string[]) => {
    const tagsTree = new TagsTree(tags.sort());

    vscode.window.createTreeView('noteSearcher-tags', {
      treeDataProvider: tagsTree
    });
  };

  public notifyIndexingStarted = (indexingTask: Promise<void>) => {
    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: 'Note Searcher: indexing...',
    }, () => indexingTask);
  };

  public showError = async (e: any) => {
    let msg = 'Note Searcher: Argh! Something broke. Sorry!\n\n' +
              'If you have time, please create an issue at https://github.com/uozuAho/note_searcher/issues\n\n' +
              'Please include the error details: \n\n' + e;
    await openInNewEditor(msg);
  };

  public addNoteSavedListener = (listener: FileChangeListener) => {
    if (this.noteSavedListener) {
      throw new Error("Listener already set. Probably a bug.");
    }

    this.noteSavedListener = listener;

    return vscode.workspace.onDidSaveTextDocument(doc => {
      const file = new VsCodeFile(doc);
      return this.noteSavedListener!(file);
    });
  };

  public addNoteDeletedListener = (listener: FileDeletedListener) => {
    if (this.noteDeletedListener) {
      throw new Error("Listener already set. Probably a bug.");
    }

    this.noteDeletedListener = listener;

    return vscode.workspace.onDidDeleteFiles(e => {
      for (const file of e.files) {
        return this.noteDeletedListener!(file.fsPath);
      }
    });
  };

  public addNoteMovedListener = (listener: FileMovedListener) => {
    if (this.noteMovedListener) {
      throw new Error("Listener already set. Probably a bug.");
    }

    this.noteMovedListener = listener;

    return vscode.workspace.onDidRenameFiles(e => {
      for (const file of e.files) {
        return this.noteMovedListener!(file.oldUri.fsPath, file.newUri.fsPath);
      }
    });
  };

  public addMovedViewToDifferentNoteListener = (listener: FileChangeListener) => {
    if (this.movedViewToDifferentNoteListener) {
      throw new Error("Listener already set. Probably a bug.");
    }

    this.movedViewToDifferentNoteListener = listener;

    return vscode.window.onDidChangeActiveTextEditor(e => {
      if (!e) { return; }
      const file = new VsCodeFile(e.document);
      return this.movedViewToDifferentNoteListener!(file);
    });
  };

  public addNoteRenamedListener = (listener: FileRenamedListener) => {
    return vscode.workspace.onDidRenameFiles(e => {
      // todo: this!
      // for (const file of e.files) {
      //   return this.noteren!(file.oldUri.fsPath, file.newUri.fsPath);
      // }
    });
  };
}

class VsCodeFile implements IFile {
  constructor(private doc: vscode.TextDocument) {}

  text = () => this.doc.getText();
  path = () => this.doc.fileName;
}

async function openInNewEditor(content: string, language?: string) {
  const document = await vscode.workspace.openTextDocument({
    language,
    content,
  });
  return await vscode.window.showTextDocument(document);
}
