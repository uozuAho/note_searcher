import * as tmoq from "typemoq";
import { DirWalker } from "../utils/dirWalker";
import { DeadLinkFinder } from "../DeadLinkFinder";
import { MockFile } from "./MockFile";
import { FileReader } from "../utils/FileReader";
import { File } from "../utils/File";

describe('DeadLinkFinder', () => {
  let walker: tmoq.IMock<DirWalker>;
  let reader: tmoq.IMock<FileReader>;
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
    reader = tmoq.Mock.ofType<FileReader>();

    finder = new DeadLinkFinder(walker.object, reader.object);
  });

  describe('find dead links', () => {
    it('finds dead links', () => {
      const fileWithDeadLink = new MockFile('[dead link](/to/nowhere)', '/stuff.txt');
      setupDir([fileWithDeadLink]);

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
        new MockFile('[link](/me/file2.txt)', '/me/file1.txt'),
        new MockFile('[link](/me/file3.txt)', '/me/file2.txt'),
        new MockFile('[link](/me/file1.txt)', '/me/file3.txt'),
      ]);

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

      const deadLinks = finder.findDeadLinks('dont care');

      expect(deadLinks.length).toBe(0);
    });

    it.each(['md', 'txt', 'log'])('cares about %s files', (ext) => {
      const fileWithDeadLink = new MockFile('[dead link](/to/nowhere)', `stuff.${ext}`);
      setupDir([fileWithDeadLink]);

      expect(finder.findDeadLinks('some path').length).toBe(1);
    });

    // just some examples, but really, any extension except the above
    it.each(['py', 'html', 'sh'])('ignores %s files', (ext) => {
      const fileWithDeadLink = new MockFile('[dead link](/to/nowhere)', `stuff.${ext}`);
      setupDir([fileWithDeadLink]);

      expect(finder.findDeadLinks('some path').length).toBe(0);
    });
  });
});
