import * as tmoq from "typemoq";
import { DirWalker } from "../utils/dirWalker";
import { DeadLinkFinderImpl } from "../DeadLinkFinder";

describe('DeadLinkFinder', () => {
  it('finds dead links', () => {
    const root = '/root';
    const walker = tmoq.Mock.ofType<DirWalker>();
    walker.setup(w => w.allFilesUnderPath(root)).returns(() => ['a', 'b', 'c']);

    const finder = new DeadLinkFinderImpl(walker.object);

    const deadLinks = finder.findDeadLinks(root);
  });
});
