const _path = require('path');

import { createFileSystem } from "../utils/NodeFileSystem";
import { InMemFileSystem } from "../utils/InMemFileSystem";
import { DefaultMultiIndex } from "./DefaultMultiIndex";

const demoDir = _path.resolve(__dirname, '../../demo_dir');
const trainsPath = _path.resolve(demoDir, 'trains.md');
const readmePath = _path.resolve(demoDir, 'readme.md');
const cheesePath = _path.resolve(demoDir, 'cheese.md');

function inMemDemoDirFs() {
  const fs = createFileSystem();
  return InMemFileSystem.fromFs(demoDir, fs);
}

describe('DefaultMultiIndex, demo dir, dead links', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = inMemDemoDirFs();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('finds all dead links in demo dir', async () => {
    await index.indexAllFiles(demoDir);

    // act
    const deadLinks = index.findAllDeadLinks();

    // assert
    expect(deadLinks).toHaveLength(2);
    expect(deadLinks.map(d => _path.parse(d.sourcePath).name))
      .toStrictEqual(['readme', 'readme']);

    expect(deadLinks.map(d => _path.parse(d.targetPath).name))
      .toStrictEqual(['nowhere', 'non_existent_note']);
  });
});

describe('DefaultMultiIndex, demo dir, tags', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = inMemDemoDirFs();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('contains transport', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.allTags()).toContain('transport');
  });
});

describe('DefaultMultiIndex, demo dir, containsNote', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = inMemDemoDirFs();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('contains trains', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.containsNote('trains')).toBe(true);
  });
});

describe('DefaultMultiIndex, demo dir, linksFrom', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = inMemDemoDirFs();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('train links to readme', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.linksFrom(trainsPath)).toContain(readmePath);
  });
});

describe('DefaultMultiIndex, demo dir, linksTo', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = inMemDemoDirFs();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('train links to readme', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.linksTo(readmePath)).toStrictEqual([trainsPath]);
  });
});

describe('DefaultMultiIndex, demo dir, search', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = inMemDemoDirFs();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('search for cheese finds cheese', async () => {
    await index.indexAllFiles(demoDir);

    const results = await index.fullTextSearch('cheese');

    expect(results).toContain(cheesePath);
  });
});
