import * as tmoq from "typemoq";
import { DirWalker } from "../utils/dirWalker";
import { DeadLinkFinder } from "../DeadLinkFinder";
import { MockFile } from "./MockFile";
import { FileReader } from "../utils/FileReader";

describe('DeadLinkFinder', () => {
  describe('find dead links', () => {
    it('finds dead links', () => {
      const root = '/root';
      const fileWithDeadLink = new MockFile(
        'hello here is a file with a [dead link](/to/nowhere)',
        root + '/stuff.txt'
      );
      const walker = tmoq.Mock.ofType<DirWalker>();
      walker.setup(w => w.allFilesUnderPath(root)).returns(() => [fileWithDeadLink.path()]);
      const reader = tmoq.Mock.ofType<FileReader>();
      reader.setup(r => r.readFile(fileWithDeadLink.path())).returns(() => fileWithDeadLink.text());
  
      const finder = new DeadLinkFinder(walker.object, reader.object);
  
      // act
      const deadLinks = finder.findDeadLinks(root);
  
      // assert
      expect(deadLinks.length).toBe(1);
      const deadLink = deadLinks[0];
      expect(deadLink.sourcePath).toBe(fileWithDeadLink.path());
      expect(deadLink.sourceLine).toBe(1);
      expect(deadLink.targetPath).toBe('/to/nowhere');
    });
  });

  // todo: line numbers
  // todo: file extensions
  // todo: no dead links
  // todo: empty
  // todo: all valid links
  // todo: ignore web links
  // todo: relative links
  // todo: links from root
});
