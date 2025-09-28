import * as tmoq from "typemoq";

import { NoteSearcher } from './noteSearcher';
import { IMultiIndex } from '../index/MultiIndex';
import { MockUi } from "../mocks/MockUi";
import { MockFile } from "../mocks/MockFile";
import { IFileSystem } from '../utils/IFileSystem';

// OBSOLETE: use noteSearcher.acceptance.test.ts instead
describe('NoteSearcher', () => {
  let ui: MockUi;
  let searcher: tmoq.IMock<IMultiIndex>;
  let noteSearcher: NoteSearcher;
  let fs: tmoq.IMock<IFileSystem>;

  describe('search', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<IMultiIndex>();
      fs = tmoq.Mock.ofType<IFileSystem>();

      noteSearcher = new NoteSearcher(ui, searcher.object, fs.object);
    });

    it('shows error when search throws', async () => {
      ui.promptForSearchReturns('search phrase');
      const error = new Error('boom');
      searcher.setup(s => s.fullTextSearch(tmoq.It.isAnyString())).throws(error);

      await noteSearcher.promptAndSearch();

      ui.didNotShowSearchResults();
      ui.showedError(error);
    });
  });

  describe('index', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<IMultiIndex>();

      noteSearcher = new NoteSearcher(ui, searcher.object, fs.object);
    });

    it('displays message when no open folder', async () => {
      ui.currentlyOpenDirReturns(null);

      await noteSearcher.indexWorkspace();

      ui.showedAnyNotification();
      searcher.verify(s => s.indexAllFiles(tmoq.It.isAnyString()), tmoq.Times.never());
    });

    it('displays error when indexing throws', async () => {
      const error = new Error('oh no!');
      ui.currentlyOpenDirReturns('a directory');
      searcher.setup(s => s.indexAllFiles('a directory')).throws(error);

      await noteSearcher.indexWorkspace();

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

  describe('copy markdown link', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<IMultiIndex>();

      noteSearcher = new NoteSearcher(ui, searcher.object, fs.object);
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

  describe('copy wiki link', () => {
    beforeEach(() => {
      ui = new MockUi();
      searcher = tmoq.Mock.ofType<IMultiIndex>();

      noteSearcher = new NoteSearcher(ui, searcher.object, fs.object);
    });

    it('copies wiki link with filename without extension', () => {
      ui.getCurrentFileReturns(new MockFile('/a/b/c.md', ''));

      const link = noteSearcher.generateWikiLinkTo('/a/b/c/d.md');

      expect(link).toBe('[[d]]');
    });

    it('windows paths are supported', () => {
      // only test on windows
      if (process.platform !== 'win32') { return; }

      ui.getCurrentFileReturns(new MockFile('c:\\a\\b.md', ''));

      const link = noteSearcher.generateWikiLinkTo('c:\\a\\b\\c\\d.md');

      expect(link).toBe('[[d]]');
    });

    it('works when no file is open', () => {
      ui.getCurrentFileReturns(null);
      ui.currentlyOpenDirReturns('/a/b');

      const link = noteSearcher.generateWikiLinkTo('/a/b/c/d.md');

      expect(link).toBe('[[d]]');
    });

    it('does not break when no file or directory is open', () => {
      ui.getCurrentFileReturns(null);
      ui.currentlyOpenDirReturns(null);

      noteSearcher.generateWikiLinkTo('/a/b/c/d.md');
    });
  });
});
