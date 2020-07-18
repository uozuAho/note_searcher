import { posixRelativePath } from "./FileSystem";

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
