import * as tmoq from "typemoq";
import { DirWalker } from "../utils/dirWalker";
import { DeadLinkFinderImpl } from "../DeadLinkFinder";
import { MockFile } from "./MockFile";

describe('DeadLinkFinder', () => {
  it('finds dead links', () => {
    const root = '/root';
    const fileWithDeadLink = new MockFile(
      'hello here is a file with a [dead link](/to/nowhere)',
      root + '/me'
    );
    const walker = tmoq.Mock.ofType<DirWalker>();
    walker.setup(w => w.allFilesUnderPath(root)).returns(() => [fileWithDeadLink.path()]);

    const finder = new DeadLinkFinderImpl(walker.object);

    // act
    const deadLinks = finder.findDeadLinks(root);

    // assert
    expect(deadLinks.length).toBe(1);
    const deadLink = deadLinks[0];
    expect(deadLink.sourcePath).toBe(fileWithDeadLink.path);
    expect(deadLink.sourceLine).toBe(1);
    expect(deadLink.targetPath).toBe('/to/nowhere');
  });
});
