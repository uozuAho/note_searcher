import { NewDeadLinkFinder } from "./NewDeadLinkFinder";
import { MapLinkIndex } from "../index/noteLinkIndex";
import { MockFile } from "../mocks/MockFile";

describe('new dead link finder', () => {
  let linkIndex: MapLinkIndex;
  let finder: NewDeadLinkFinder;

  const setupLinks = (fileLinks: MockFile[]) => {
    for (const file of fileLinks) {
      linkIndex.addFile(file.path(), file.text());
    }
  };

  beforeEach(() => {
    linkIndex = new MapLinkIndex();
    finder = new NewDeadLinkFinder(linkIndex);
  });

  it('finds dead link', () => {
    setupLinks([
      new MockFile('/a.md', '[](/b.txt)')
    ]);

    const deadLinks = finder.findAllDeadLinks();

    expect(deadLinks).toHaveLength(1);
    expect(deadLinks[0].sourcePath).toBe('/a.md');
    expect(deadLinks[0].targetPath).toBe('/b.txt');
  });

  it('finds no dead links', () => {
    setupLinks([
      new MockFile('/a.md', '[](/b.txt)'),
      new MockFile('/b.txt', '')
    ]);

    const deadLinks = finder.findAllDeadLinks();

    expect(deadLinks).toHaveLength(0);
  });

  it('links to subdirs work', () => {
    setupLinks([
      new MockFile('/a.md', '[](/b/c/e.txt)'),
      new MockFile('/b/c/e.txt', '')
    ]);

    const deadLinks = finder.findAllDeadLinks();

    expect(deadLinks).toHaveLength(0);
  });

  it('links to parent dirs work', () => {
    setupLinks([
      new MockFile('/b/c/e.txt', '[](/a.md)'),
      new MockFile('/a.md', '')
    ]);

    const deadLinks = finder.findAllDeadLinks();

    expect(deadLinks).toHaveLength(0);
  });

  it('supports relative links to parent dirs', () => {
    setupLinks([
      new MockFile('/b/c/e.txt', '[](../../a.md)'),
      new MockFile('/a.md', '')
    ]);

    const deadLinks = finder.findAllDeadLinks();

    expect(deadLinks).toHaveLength(0);
  });

  it('supports relative links to subdirs', () => {
    setupLinks([
      new MockFile('/a/b.md', '[](c/d.txt)'),
      new MockFile('/a/c/d.txt', '')
    ]);

    const deadLinks = finder.findAllDeadLinks();

    expect(deadLinks).toHaveLength(0);
  });
});
