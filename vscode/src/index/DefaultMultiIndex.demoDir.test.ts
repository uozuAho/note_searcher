const _path = require('path');

import { createFileSystem } from "../utils/FileSystem";
import { DefaultMultiIndex } from "./DefaultMultiIndex";

const demoDir = _path.resolve(__dirname, '../../demo_dir');
const trainsPath = _path.resolve(demoDir, 'trains.md');
const readmePath = _path.resolve(demoDir, 'readme.md');
const cheesePath = _path.resolve(demoDir, 'cheese.md');
const aboutNodeModulesPath = _path.resolve(demoDir, 'node_modules/about_node_modules.md');
const ignoredFilePath = _path.resolve(demoDir, 'ignored_stuff/ignored_file.md');

describe('DefaultMultiIndex, demo dir, dead links', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('finds all dead links in demo dir', async () => {
    await index.indexAllFiles(demoDir);

    // act
    const deadLinks = index.findAllDeadLinks();

    // assert
    expect(deadLinks).toHaveLength(4);
    expect(deadLinks.map(d => _path.parse(d.sourcePath).name))
      .toStrictEqual(['readme', 'readme', 'readme', 'readme']);

    expect(deadLinks.map(d => _path.parse(d.targetPath).name))
      .toStrictEqual(['nowhere', 'non_existent_note', 'ignored_file', 'about_node_modules']);
  });

  it('ignores dead links in ignored files', async () => {
    await index.indexAllFiles(demoDir);

    const deadLinkSourceNames = index.findAllDeadLinks()
      .map(l => l.sourcePath)
      .map(p => _path.parse(p).name);

    expect(deadLinkSourceNames).not.toContain('ignored_file');
  });

  it('includes links to ignored files', async () => {
    await index.indexAllFiles(demoDir);

    const deadLinksFromReadmeToIgnoredFile = index.findAllDeadLinks()
      .filter(l => l.sourcePath.includes('readme'))
      .filter(l => l.targetPath.includes('ignored_file'));

    expect(deadLinksFromReadmeToIgnoredFile.length).toBeGreaterThan(0);
  });
});

describe('DefaultMultiIndex, demo dir, tags', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('contains transport', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.allTags()).toContain('transport');
  });

  it('ignores node_modules', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.allTags()).not.toContain('node_modules_ignored_tag');
  });

  it('ignores ignored directories', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.allTags()).not.toContain('ignored_tag');
  });
});

describe('DefaultMultiIndex, demo dir, containsNote', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('contains trains', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.containsNote('trains')).toBe(true);
  });

  it('ignores node_modules', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.containsNote('about_node_modules')).toBe(false);
  });

  it('ignores ignored directories', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.containsNote('ignored_file')).toBe(false);
  });
});

describe('DefaultMultiIndex, demo dir, linksFrom', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('train links to readme', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.linksFrom(trainsPath)).toStrictEqual([readmePath]);
  });

  it('ignores node_modules', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.linksFrom(aboutNodeModulesPath).length).toBe(0);
  });

  it('ignores ignored dirs', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.linksFrom(ignoredFilePath).length).toBe(0);
  });
});

describe('DefaultMultiIndex, demo dir, linksTo', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('train links to readme', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.linksTo(readmePath)).toStrictEqual([trainsPath]);
  });

  it('ignores node_modules', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.linksTo(aboutNodeModulesPath).length).toBe(0);
  });

  it('ignores ignored dirs', async () => {
    await index.indexAllFiles(demoDir);

    expect(index.linksTo(ignoredFilePath).length).toBe(0);
  });
});

describe('DefaultMultiIndex, demo dir, search', () => {
  let index: DefaultMultiIndex;

  beforeEach(() => {
    const fs = createFileSystem();
    index = new DefaultMultiIndex(fs, demoDir);
  });

  it('search for cheese finds cheese', async () => {
    await index.indexAllFiles(demoDir);

    const results = await index.fullTextSearch('cheese');

    expect(results).toContain(cheesePath);
  });

  it('ignores node_modules', async () => {
    await index.indexAllFiles(demoDir);

    const results = await index.fullTextSearch('9ad8gggg86eef9869d8a6deddd');

    expect(results).not.toContain(aboutNodeModulesPath);
  });

  it('ignores ignored dirs', async () => {
    await index.indexAllFiles(demoDir);

    const results = await index.fullTextSearch('9ad8e6c986eef9869d8a6deddd');

    expect(results).not.toContain(ignoredFilePath);
  });
});

describe('DefaultMultiIndex, demo dir, on modify ignored file', () => {
  let index: DefaultMultiIndex;

  beforeEach(async () => {
    const fs = createFileSystem();
    index = new DefaultMultiIndex(fs, demoDir);
    await index.indexAllFiles(demoDir);

    const ignoredText = await fs.readFileAsync(ignoredFilePath);
    await index.onFileModified(ignoredFilePath, ignoredText);
  });

  it('does not index ignored text', async () => {
    const results = await index.fullTextSearch('9ad8e6c986eef9869d8a6deddd');
    expect(results).toHaveLength(0);
  });

  it('does not index ignored links from', async () => {
    const results = await index.linksFrom(ignoredFilePath);
    expect(results).toHaveLength(0);
  });

  it('does not index ignored links to', async () => {
    const results = await index.linksTo(ignoredFilePath);
    expect(results).toHaveLength(0);
  });

  it('does not index dead links', async () => {
    const results = await index.findAllDeadLinks();
    expect(results.filter(r => r.sourcePath === ignoredFilePath)).toHaveLength(0);
  });

  it('does not index tags', async () => {
    const tags = await index.allTags();
    expect(tags.includes('ignored_tag')).toBe(false);
  });
});

describe('DefaultMultiIndex, demo dir, on delete file', () => {
  let index: DefaultMultiIndex;

  beforeEach(async () => {
    const fs = createFileSystem();
    index = new DefaultMultiIndex(fs, demoDir);
    await index.indexAllFiles(demoDir);

    // we don't actually delete the file here
    await index.onFileDeleted(trainsPath);
  });

  it('is not in search results', async () => {
    const results = await index.fullTextSearch('trains');
    expect(results).not.toContain(trainsPath);
  });

  it('no links from the deleted file', async () => {
    expect(index.linksTo(readmePath)).not.toContain(trainsPath);
  });

  // todo: fix this when fixing 'links to' behaviour
  it.skip('no links to the deleted file', async () => {
    expect(index.linksFrom(readmePath)).not.toContain(trainsPath);
  });
});
