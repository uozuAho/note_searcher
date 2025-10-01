const _path = require('path');

import { posixRelativePath, createNodeFileSystem } from "./NodeFileSystem";

describe('FileSystem', () => {
  describe('posixRelativePath', () => {
    it.each([
      ['simple',                   '/a/b/c', '/a/b/c/d', 'd'],
      ['handles trailing slash',   '/a/b/c/', '/a/b/c/d', 'd'],
      ['handles nested dir',       '/a/b/c/', '/a/b/c/d/e', 'd/e'],
      ['handles extensions',       '/a/b/c.md', '/a/b/c/d.md', 'c/d.md'],
    ])('%s: %s, %s -> %s', (description: string, path1: string, path2: string, expectedPath: string) => {
      expect(posixRelativePath(path1, path2)).toBe(expectedPath);
    });

    if (process.platform === 'win32') {
      describe('windows posixRelativePath', () => {
        it.each([
          ['understands windows paths', '\\a\\b\\c', '\\a\\b\\c\\d', 'd'],
          ['converts windows to unix', '\\a\\b', '\\a\\b\\c\\d\\e', 'c/d/e']
        ])('%s: %s, %s -> %s', (description: string, path1: string, path2: string, expectedPath: string) => {
          expect(posixRelativePath(path1, path2)).toBe(expectedPath);
        });
      });
    }
  });
});

const demoDir = _path.resolve(__dirname, '../../demo_dir');
const readmePath = _path.resolve(demoDir, 'readme.md');

describe('FileSystem, demo dir', () => {
  const fs = createNodeFileSystem();

  it('ignores specific file', () => {
    const ignore = (path: string) => path === readmePath;
    const allDemoDirFiles = Array.from(fs.allFilesUnderPath(demoDir, ignore));
    expect(allDemoDirFiles).not.toContain(readmePath);
  });

  it('ignores everything', () => {
    const ignore = (path: string) => path.includes('demo_dir');
    const allDemoDirFiles = Array.from(fs.allFilesUnderPath(demoDir, ignore));
    expect(allDemoDirFiles).toHaveLength(0);
  });
});

describe('FileSystem, demo dir, allFilesUnderPath', () => {
  let allDemoDirFiles: string[];

  beforeEach(() => {
    const fs = createNodeFileSystem();
    allDemoDirFiles = Array.from(fs.allFilesUnderPath(demoDir));
  });

  it('contains readme', () => {
    expect(allDemoDirFiles).toContain(readmePath);
  });
});

const demoSubDir = _path.resolve(__dirname, '../../demo_dir/subdir');
const subFile = _path.resolve(__dirname, '../../demo_dir/subdir/my_sub_file.md');

describe('FileSystem, demo subdir, allFilesUnderPath', () => {
  let allDemoDirFiles: string[];

  beforeEach(() => {
    const fs = createNodeFileSystem();
    allDemoDirFiles = Array.from(fs.allFilesUnderPath(demoSubDir));
  });

  it('contains subfile', () => {
    expect(allDemoDirFiles).toContain(subFile);
  });
});
