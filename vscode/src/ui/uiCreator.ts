import { INoteSearcherUi } from "./INoteSearcherUi";
import { VsCodeNoteSearcherUi } from "./VsCodeNoteSearcherUi";

export function createNoteSearcherUi(): INoteSearcherUi {
  return new VsCodeNoteSearcherUi();
}
