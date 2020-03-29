import { NoteSearcherUi } from '../vscode';
import { NoteSearcher } from '../noteSearcher';
import { Searcher } from '../search';
import * as tmoq from "typemoq";

describe('NoteSearcher', () => {
  let searcher: tmoq.IMock<Searcher>;
  let ui: tmoq.IMock<NoteSearcherUi>;
  let noteSearcher: NoteSearcher;

  const user_input_on_search = (input: string) => {
    ui.setup(u => u.promptForSearch(tmoq.It.isAnyString())).returns(
      () => Promise.resolve(input));
  };

  beforeEach(() => {
    searcher = tmoq.Mock.ofType<Searcher>();
    ui = tmoq.Mock.ofType<NoteSearcherUi>();
    noteSearcher = new NoteSearcher(ui.object, searcher.object);
  });

  it('search passes input to searcher', async () => {
    user_input_on_search('search phrase');

    await noteSearcher.search();

    searcher.verify(s => s.search('search phrase'), tmoq.Times.once());
  });
});
