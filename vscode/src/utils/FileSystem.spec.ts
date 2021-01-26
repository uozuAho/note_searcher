const _path = require('path');

import { posixRelativePath, createFileSystem } from "./FileSystem";

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
const notIgnoredFilePath = _path.resolve(demoDir, 'not_ignored_stuff/not_ignored_file.md');
const ignoredFilePath = _path.resolve(demoDir, 'ignored_stuff/ignored_file.md');
const nestedNotIgnoredFilePath = _path.resolve(demoDir, 'subdir/ignored_stuff/not_ignored.md');
const topNodeModulesFilePath = _path.resolve(demoDir, 'node_modules/about_node_modules.md');
const nestedNodeModulesFilePath = _path.resolve(demoDir, 'subdir/node_modules/nested_node_modules.md');

describe('FileSystem, demo dir, allFilesUnderPath', () => {

  let allDemoDirFiles: string[];

  beforeEach(() => {
    const fs = createFileSystem();
    allDemoDirFiles = Array.from(fs.allFilesUnderPath(demoDir));
  });

  it('contains readme', () => {
    expect(allDemoDirFiles).toContain(readmePath);
  });

  it('contains not_ignored_file', () => {
    expect(allDemoDirFiles).toContain(notIgnoredFilePath);
  });

  it('contains nested not_ignored_file', () => {
    expect(allDemoDirFiles).toContain(nestedNotIgnoredFilePath);
  });

  it('does not contain ignored_file' , () => {
    expect(allDemoDirFiles).not.toContain(ignoredFilePath);
  });

  it('does not contain any node_modules' , () => {
    expect(allDemoDirFiles).not.toContain(topNodeModulesFilePath);
    expect(allDemoDirFiles).not.toContain(nestedNodeModulesFilePath);
  });
});
