import { NoteSearcher } from '../noteSearcher';
import { SearchService } from '../searchService';
import * as tmoq from "typemoq";
import { MockUi, MockFile } from "./MockUi";

describe('NoteSearcher', () => {
  let ui: MockUi;
  let searcher: tmoq.IMock<SearchService>;
  let noteSearcher: NoteSearcher;

  const searcher_returns = (results: string[]) => {
    searcher.setup(s =>
      s.search(tmoq.It.isAnyString()))
      .returns(
        () => Promise.resolve(results)
      );
  };

  describe('search', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      noteSearcher = new NoteSearcher(ui, searcher.object);
    });

    it('passes input to searcher', async () => {
      ui.promptForSearchReturns('search phrase');

      await noteSearcher.search();

      searcher.verify(s => s.search('search phrase'), tmoq.Times.once());
    });

    it('does nothing when input is empty', async () => {
      ui.promptForSearchReturns('');

      await noteSearcher.search();

      searcher.verify(s => s.search(tmoq.It.isAnyString()), tmoq.Times.never());
    });

    it('shows search results', async () => {
      ui.promptForSearchReturns('search phrase');
      searcher_returns(['a', 'b', 'c']);

      await noteSearcher.search();

      ui.showedSearchResults(['a', 'b', 'c']);
    });

    it('shows error when search throws', async () => {
      ui.promptForSearchReturns('search phrase');
      const error = new Error('boom');
      searcher.setup(s => s.search(tmoq.It.isAnyString())).throws(error);

      await noteSearcher.search();

      ui.didNotShowSearchResults();
      ui.showedError(error);
    });
  });

  describe('index', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      noteSearcher = new NoteSearcher(ui, searcher.object);
    });

    it('shows index start and end notifications', async () => {
      ui.currentlyOpenDirReturns('a directory');

      await noteSearcher.index();

      ui.showedAnyNotification(2);
      searcher.verify(s => s.index(tmoq.It.isAnyString()), tmoq.Times.once());
    });

    it('displays message when no open folder', async () => {
      ui.currentlyOpenDirReturns(null);

      await noteSearcher.index();

      ui.showedAnyNotification();
      searcher.verify(s => s.index(tmoq.It.isAnyString()), tmoq.Times.never());
    });

    it('displays error when indexing throws', async () => {
      const error = new Error('oh no!');
      ui.currentlyOpenDirReturns('a directory');
      searcher.setup(s => s.index('a directory')).throws(error);

      await noteSearcher.index();

      ui.showedError(error);
    });
  });

  describe('when current document changes', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      noteSearcher = new NoteSearcher(ui, searcher.object);
    });

    it('should show related files', async () => {
      const relatedFiles = ['a', 'b', 'b'];
      searcher_returns(relatedFiles);

      ui.currentFileChanged(new MockFile('contents', 'path'));

      // todo: control time to avoid waiting here
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });

      ui.showedRelatedFiles(relatedFiles);
    });

    // it does not include current file in search results
    // it does not update files until 500ms after last doc changed
    // it does not update files if current file is empty
  });
});
