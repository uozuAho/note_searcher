import { NoteSearcher } from '../noteSearcher';
import { SearchService } from '../searchService';
import * as tmoq from "typemoq";
import { MockUi } from "./MockUi";
import { MockFile } from "./MockFile";
import { DelayedExecutor } from '../utils/delayedExecutor';
import { DeadLinkFinder, DeadLink } from '../DeadLinkFinder';
import { NoteSearcherConfigProvider, NoteSearcherConfig } from '../NoteSearcherConfigProvider';

describe('NoteSearcher', () => {
  let ui: MockUi;
  let searcher: tmoq.IMock<SearchService>;
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

  const defaultConfig = (): NoteSearcherConfig => ({
    deadLinks: {
      showOnSave: true
    }
  });

  describe('search', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      configProvider.setup(c => c.getConfig()).returns(() => defaultConfig());

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
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
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      configProvider.setup(c => c.getConfig()).returns(() => defaultConfig());

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
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

  describe('show dead links', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      configProvider.setup(c => c.getConfig()).returns(() => defaultConfig());

      ui.currentlyOpenDirReturns('a directory');

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('shows dead links as error', () => {
      deadLinkFinder.setup(d => d.findDeadLinks(tmoq.It.isAny())).returns(() => [
        new DeadLink('/some/path', '/path/to/nowhere')
      ]);

      noteSearcher.showDeadLinks();

      ui.showedError();
    });

    it('does not show anything when there are no dead links', () => {
      deadLinkFinder.setup(d => d.findDeadLinks(tmoq.It.isAny())).returns(() => []);

      noteSearcher.showDeadLinks();

      ui.didNotShowError();
    });
  });

  describe('when file is saved', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      configProvider.setup(c => c.getConfig()).returns(() => defaultConfig());

      ui.currentlyOpenDirReturns('a directory');
      deadLinkFinder.setup(d => d.findDeadLinks(tmoq.It.isAny())).returns(() => []);

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('updates index', () => {
      const file = new MockFile('content', 'path');
      const indexSpy = spyOn(noteSearcher, 'index');

      ui.saveFile(file);

      expect(indexSpy).toHaveBeenCalled();
    });

    it('checks for dead links', () => {
      const file = new MockFile('content', 'path');
      const showDeadLinks = spyOn(noteSearcher, 'showDeadLinks');

      ui.saveFile(file);

      expect(showDeadLinks).toHaveBeenCalled();
    });

    it('does not check for dead links when turned off in config', () => {
      const config = defaultConfig();
      config.deadLinks.showOnSave = false;
      configProvider.reset();
      configProvider.setup(c => c.getConfig()).returns(() => config);
      const showDeadLinks = spyOn(noteSearcher, 'showDeadLinks');

      ui.saveFile(new MockFile('content', 'path'));

      expect(showDeadLinks).not.toHaveBeenCalled();
    });
  });

  describe('when current document changes', () => {
    let delayedExecutor: tmoq.IMock<DelayedExecutor>;

    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();
      delayedExecutor = tmoq.Mock.ofType<DelayedExecutor>();

      noteSearcher = new NoteSearcher(ui,
        searcher.object,
        deadLinkFinder.object,
        configProvider.object,
        delayedExecutor.object);
    });

    it('should schedule show related files', async () => {
      ui.currentFileChanged(new MockFile('contents', 'path'));

      delayedExecutor.verify(d => d.cancelAll(), tmoq.Times.once());
      delayedExecutor.verify(d =>
        d.executeInMs(tmoq.It.isAnyNumber(), tmoq.It.isAny()), tmoq.Times.once());
    });
  });

  describe('update related files', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('does not include current file in related files', async () => {
      const currentFile = new MockFile('asdf', 'path/file/a');
      const relatedFiles = [currentFile.path(), 'path/file/b', 'path/file/c'];
      searcher_returns(relatedFiles);

      await noteSearcher.updateRelatedFiles(currentFile);

      ui.showedRelatedFiles(['path/file/b', 'path/file/c']);
    });

    it('does not update files if current file is empty', async () => {
      const currentFile = new MockFile('', 'path/file/a');
      const relatedFiles = [currentFile.path(), 'path/file/b', 'path/file/c'];
      searcher_returns(relatedFiles);

      await noteSearcher.updateRelatedFiles(currentFile);

      ui.didNotShowRelatedFiles();
    });
  });

  describe('createTagAndKeywordQuery', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<SearchService>();
      deadLinkFinder = tmoq.Mock.ofType<DeadLinkFinder>();
      configProvider = tmoq.Mock.ofType<NoteSearcherConfigProvider>();

      noteSearcher = new NoteSearcher(ui,
        searcher.object, deadLinkFinder.object, configProvider.object);
    });

    it('creates query', () => {
      const tags = ['a', 'b', 'c'];
      const keywords = ['d', 'e'];

      const query = noteSearcher.createTagAndKeywordQuery(tags, keywords);

      expect(query).toEqual('#a #b #c d e');
    });

    it('removes overlapping keywords', () => {
      const tags = ['a', 'b', 'c'];
      const keywords = ['c', 'd'];

      const query = noteSearcher.createTagAndKeywordQuery(tags, keywords);

      expect(query).toEqual('#a #b #c d');
    });
  });
});
