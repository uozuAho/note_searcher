import { NoteSearcherUi } from "./NoteSearcherUi";
import { VsCodeNoteSearcherUi } from "./VsCodeNoteSearcherUi";

export function createNoteSearcherUi(): NoteSearcherUi {
  return new VsCodeNoteSearcherUi();
}
