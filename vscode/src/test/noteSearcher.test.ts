import { NoteSearcherUi } from '../vscode';
import { NoteSearcher } from '../noteSearcher';
import { Searcher } from '../search';
import * as tmoq from "typemoq";

describe('NoteSearcher', () => {
  it('should', async () => {
    const searcher = tmoq.Mock.ofType<Searcher>();
    const ui = tmoq.Mock.ofType<NoteSearcherUi>();
    const ns = new NoteSearcher(ui.object, searcher.object);

    await ns.search();

    ui.verify(u => u.promptForSearch(tmoq.It.isAnyString()), tmoq.Times.once());
  });
});
