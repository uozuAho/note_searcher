import { NoteSearcherUi } from '../vscode';
import { NoteSearcher } from '../noteSearcher';
import { SearchService } from '../searchService';
import * as tmoq from "typemoq";

describe('NoteSearcher', () => {
  let searcher: tmoq.IMock<SearchService>;
  let ui: tmoq.IMock<NoteSearcherUi>;
  let noteSearcher: NoteSearcher;

  const user_input_on_search = (input: string) => {
    ui.setup(u =>
      u.promptForSearch(tmoq.It.isAnyString()))
      .returns(
        () => Promise.resolve(input)
      );
  };

  const searcher_returns = (results: string[]) => {
    searcher.setup(s =>
      s.search(tmoq.It.isAnyString()))
      .returns(
        () => Promise.resolve(results)
      );
  };

  describe('search', () => {
    beforeEach(() => {
      searcher = tmoq.Mock.ofType<SearchService>();
      ui = tmoq.Mock.ofType<NoteSearcherUi>();
      noteSearcher = new NoteSearcher(ui.object, searcher.object);
    });

    it('passes input to searcher', async () => {
      user_input_on_search('search phrase');

      await noteSearcher.search();

      searcher.verify(s => s.search('search phrase'), tmoq.Times.once());
    });

    it('does nothing when input is empty', async () => {
      user_input_on_search('');

      await noteSearcher.search();

      searcher.verify(s => s.search(tmoq.It.isAnyString()), tmoq.Times.never());
    });

    it('shows search results', async () => {
      user_input_on_search('search phrase');
      searcher_returns(['a', 'b', 'c']);

      await noteSearcher.search();

      ui.verify(u => u.showSearchResults(['a', 'b', 'c']), tmoq.Times.once());
    });

    it('shows error when search throws', async () => {
      user_input_on_search('search phrase');
      const error = new Error('boom');
      searcher.setup(s => s.search(tmoq.It.isAnyString())).throws(error);

      await noteSearcher.search();

      ui.verify(u => u.showSearchResults(tmoq.It.isAny()), tmoq.Times.never());
      ui.verify(u => u.showError(error), tmoq.Times.once());
    });
  });
});
