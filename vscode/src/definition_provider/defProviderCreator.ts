import { NoteLocator } from "./NoteLocator";
import { VsCodeWikiLinkDefinitionProvider } from "./VsCodeWikiLinkDefinitionProvider";

export function createWikiLinkDefinitionProvider(noteLocator: NoteLocator) {
  return new VsCodeWikiLinkDefinitionProvider(noteLocator);
}
