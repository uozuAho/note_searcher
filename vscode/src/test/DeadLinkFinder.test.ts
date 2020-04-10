import * as tmoq from "typemoq";
import { DirWalker } from "../utils/dirWalker";
import { DeadLinkFinder } from "../DeadLinkFinder";
import { MockFile } from "./MockFile";
import { FileSystem } from "../utils/FileSystem";
import { File } from "../utils/File";

describe('DeadLinkFinder', () => {
  let walker: tmoq.IMock<DirWalker>;
  let reader: tmoq.IMock<FileSystem>;
  let finder: DeadLinkFinder;

  const setupDir = (files: File[]) => {
    walker.setup(w => w.allFilesUnderPath(tmoq.It.isAny()))
      .returns(() => files.map(f => f.path()));
    for (const file of files) {
      reader.setup(r => r.readFile(file.path())).returns(() => file.text());
    }
  };

  beforeEach(() => {
    walker = tmoq.Mock.ofType<DirWalker>();
    reader = tmoq.Mock.ofType<FileSystem>();

    finder = new DeadLinkFinder(walker.object, reader.object);
  });

  describe('find dead links', () => {
    it('finds dead links', () => {
      const fileWithDeadLink = new MockFile('[link](/to/nowhere)', '/stuff.txt');
      setupDir([fileWithDeadLink]);
      reader.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => false);

      // act
      const deadLinks = finder.findDeadLinks('some dir');

      // assert
      expect(deadLinks.length).toBe(1);
      const deadLink = deadLinks[0];
      expect(deadLink.sourcePath).toBe(fileWithDeadLink.path());
      expect(deadLink.targetPath).toBe('/to/nowhere');
    });

    it('returns empty when all links are good', () => {
      setupDir([
        new MockFile('[](asdf)', '/me/file1.txt'),
        new MockFile('[](qwer)', '/me/file2.txt'),
      ]);
      reader.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => true);

      // act
      const deadLinks = finder.findDeadLinks('dont care');

      // assert
      expect(deadLinks.length).toBe(0);
    });

    it('handles empty dir', () => {
      setupDir([]);

      const deadLinks = finder.findDeadLinks('dont care');

      expect(deadLinks.length).toBe(0);
    });

    it('ignores links starting with http', () => {
      setupDir([
        new MockFile('[link](https://www.stuff.com)', '/me/file1.txt'),
      ]);
      reader.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => false);

      const deadLinks = finder.findDeadLinks('dont care');

      expect(deadLinks.length).toBe(0);
    });

    it('handles links to non-text files', () => {
      setupDir([
        new MockFile('[link](/some/non/text/file)', 'a_file.txt'),
      ]);
      reader.setup(r => r.fileExists('/some/non/text/file')).returns(() => true);

      const deadLinks = finder.findDeadLinks('dont care');

      expect(deadLinks.length).toBe(0);
    });

    // it('handles links from root directory', () => {
    //   const root = '/some/root/dir';
    //   setupDir([
    //     new MockFile('[link](/to/another/file)', 'a_file.txt'),
    //   ]);
    //   reader.setup(r => r.exists('/to/another/file')).returns(() => true);
    //   reader.setup(r => r.exists('/to/another/file')).returns(() => true);

    //   const deadLinks = finder.findDeadLinks('dont care');

    //   expect(deadLinks.length).toBe(0);
    // });

    // it('handles relative links', () => {

    // });

    it.each(['md', 'txt', 'log'])('cares about %s files', (ext) => {
      const fileWithDeadLink = new MockFile('[dead link](/to/nowhere)', `stuff.${ext}`);
      setupDir([fileWithDeadLink]);
      reader.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => false);

      expect(finder.findDeadLinks('some path').length).toBe(1);
    });

    // just some examples, but really, any extension except the above
    it.each(['py', 'html', 'sh'])('ignores %s files', (ext) => {
      const fileWithDeadLink = new MockFile('[dead link](/to/nowhere)', `stuff.${ext}`);
      setupDir([fileWithDeadLink]);
      reader.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => false);

      expect(finder.findDeadLinks('some path').length).toBe(0);
    });
  });
});
