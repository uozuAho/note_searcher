import { relativePath } from "./FileSystem";

describe('FileSystem', () => {
  describe('relativePath', () => {
    it.each([
      ['simple',                   '/a/b/c', '/a/b/c/d', 'd'],
      ['trailing slash',           '/a/b/c/', '/a/b/c/d', 'd'],
      ['nested dir',               '/a/b/c/', '/a/b/c/d/e', 'd/e'],
    ])('%s: %s, %s -> %s', (description: string, path1: string, path2: string, expectedPath: string) => {
      expect(relativePath(path1, path2)).toBe(expectedPath);
    });

    if (process.platform === 'win32') {
      describe('windows relativePath', () => {
        it.each([
          ['understands windows paths', '\\a\\b\\c', '\\a\\b\\c\\d', 'd'],
          ['converts windows to unix', '\\a\\b\\c', '\\a\\b\\c\\d\\e', 'd/e']
        ])('%s: %s, %s -> %s', (description: string, path1: string, path2: string, expectedPath: string) => {
          expect(relativePath(path1, path2)).toBe(expectedPath);
        });
      });
    }
  });
});
