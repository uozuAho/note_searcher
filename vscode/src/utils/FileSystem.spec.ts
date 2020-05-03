import { relativePath } from "./FileSystem";

describe('FileSystem', () => {
  describe('relativePath', () => {
    it.each([
      ['simple',                   '/a/b/c', '/a/b/c/d', 'd'],
      ['trailing slash',           '/a/b/c/', '/a/b/c/d', 'd'],
      ['nested dir',               '/a/b/c/', '/a/b/c/d/e', 'd/e'],
      ['converts windows to unix', '\\a\\b\\c', '\\a\\b\\c\\d', 'd']
    ])('%s: %s, %s -> %s', (description: string, path1: string, path2: string, expectedPath: string) => {
      expect(relativePath(path1, path2)).toBe(expectedPath);
    });
  });
});
