import * as tmoq from "typemoq";

import { NoteSearcher } from './noteSearcher';
import { NoteIndex } from '../index/NoteIndex';
import { MockUi } from "../mocks/MockUi";
import { MockFile } from "../mocks/MockFile";
import { DeadLinkFinder, Link } from '../dead_links/DeadLinkFinder';
import { NoteSearcherConfigProvider, NoteSearcherConfig } from './NoteSearcherConfigProvider';

describe('NoteSearcher', () => {
  let ui: MockUi;
  let searcher: tmoq.IMock<NoteIndex>;
  let deadLinkFinder: tmoq.IMock<DeadLinkFinder>;
  let configProvider: tmoq.IMock<NoteSearcherConfigProvider>;
  let noteSearcher: NoteSearcher;

  const searcher_returns = (results: string[]) => {
    searcher.setup(s =>
      s.search(tmoq.It.isAnyString()))
      .returns(
        () => Promise.resolve(results)
      );
  };

  const defaultConfig = (): NoteSearcherConfig => ({});

  describe('on extension activated', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<NoteIndex>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('updates index', () => {
      ui.currentlyOpenDirReturns('some dir');
      const index = spyOn(noteSearcher, 'index');

      noteSearcher.notifyExtensionActivated();

      expect(index).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<NoteIndex>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      configProvider.setup(c => c.getConfig()).returns(() => defaultConfig());

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('passes input to searcher', async () => {
      ui.promptForSearchReturns('search phrase');

      await noteSearcher.promptAndSearch();

      searcher.verify(s => s.search('search phrase'), tmoq.Times.once());
    });

    it('does nothing when input is empty', async () => {
      ui.promptForSearchReturns('');

      await noteSearcher.promptAndSearch();

      searcher.verify(s => s.search(tmoq.It.isAnyString()), tmoq.Times.never());
    });

    it('shows search results', async () => {
      ui.promptForSearchReturns('search phrase');
      searcher_returns(['a', 'b', 'c']);

      await noteSearcher.promptAndSearch();

      ui.showedSearchResults(['a', 'b', 'c']);
    });

    it('shows error when search throws', async () => {
      ui.promptForSearchReturns('search phrase');
      const error = new Error('boom');
      searcher.setup(s => s.search(tmoq.It.isAnyString())).throws(error);

      await noteSearcher.promptAndSearch();

      ui.didNotShowSearchResults();
      ui.showedError(error);
    });
  });

  describe('index', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<NoteIndex>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      configProvider.setup(c => c.getConfig()).returns(() => defaultConfig());

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('shows indexing in progress', async () => {
      ui.currentlyOpenDirReturns('a directory');

      await noteSearcher.index();

      ui.notifiedIndexingStarted();
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

  describe('create note id', () => {
    it('should be local time', () => {
      const now = new Date();
      const localHour = now.getHours().toString().padStart(2, '0');

      // ugh...
      const yearPattern = '20\\d\\d';
      const monthPattern = '\\d\\d';
      const dayPattern = '\\d\\d';
      const minutePattern = '\\d\\d';
      const expectedPattern = [
        yearPattern,
        monthPattern,
        dayPattern,
        localHour,
        minutePattern,
      ].join('');
      const regex = new RegExp(expectedPattern);

      // act and assert
      expect(noteSearcher.createNoteId()).toMatch(regex);
    });
  });

  describe('copy link', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<NoteIndex>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('copies link relative to open file', () => {
      ui.getCurrentFileReturns(new MockFile('/a/b/c.md', ''));

      const link = noteSearcher.generateMarkdownLinkTo('/a/b/c/d.md');

      expect(link).toBe('[](c/d.md)');
    });

    it('windows paths are converted to posix', () => {
      // only test on windows
      if (process.platform !== 'win32') { return; }

      ui.getCurrentFileReturns(new MockFile('c:\\a\\b.md', ''));

      const link = noteSearcher.generateMarkdownLinkTo('c:\\a\\b\\c\\d.md');

      expect(link).toBe('[](b/c/d.md)');
    });

    it('copies filename only, when no file is open', () => {
      ui.getCurrentFileReturns(null);
      ui.currentlyOpenDirReturns('/a/b');

      const link = noteSearcher.generateMarkdownLinkTo('/a/b/c/d.md');

      expect(link).toBe('[](d.md)');
    });

    it('does not break when no file or directory is open', () => {
      ui.getCurrentFileReturns(null);
      ui.currentlyOpenDirReturns(null);

      noteSearcher.generateMarkdownLinkTo('/a/b/c/d.md');
    });
  });

  describe('show dead links', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<NoteIndex>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      configProvider.setup(c => c.getConfig()).returns(() => defaultConfig());

      ui.currentlyOpenDirReturns('a directory');

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('shows dead links', () => {
      deadLinkFinder.setup(d => d.findAllDeadLinks()).returns(() => [
        new Link('/some/path', '/path/to/nowhere')
      ]);

      noteSearcher.showDeadLinks();

      ui.showedDeadLinks();
    });
  });

  describe('when file is saved', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<NoteIndex>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      configProvider.setup(c => c.getConfig()).returns(() => defaultConfig());

      ui.currentlyOpenDirReturns('a directory');
      deadLinkFinder.setup(d => d.findAllDeadLinks()).returns(() => []);

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('updates index', async () => {
      const file = new MockFile('path', 'content');
      const indexSpy = spyOn(noteSearcher, 'index');

      await ui.saveFile(file);

      expect(indexSpy).toHaveBeenCalled();
    });

    it('checks for dead links', async () => {
      const file = new MockFile('path', 'content');
      const showDeadLinks = spyOn(noteSearcher, 'showDeadLinks');

      await ui.saveFile(file);

      expect(showDeadLinks).toHaveBeenCalled();
    });
  });
});
