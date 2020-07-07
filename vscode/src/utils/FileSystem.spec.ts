import { relativePath, createFileSystem } from "./FileSystem";

describe('FileSystem', () => {
  describe('relativePath', () => {
    it.each([
      ['simple',                   '/a/b/c', '/a/b/c/d', 'd'],
      ['handles trailing slash',   '/a/b/c/', '/a/b/c/d', 'd'],
      ['handles nested dir',       '/a/b/c/', '/a/b/c/d/e', 'd/e'],
      ['handles extensions',       '/a/b/c.md', '/a/b/c/d.md', 'c/d.md'],
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

describe('createFileSystem', () => {
  const fs = createFileSystem();

  describe('all files under path', () => {
    it('returns posix absolute paths', () => {
      expect(fs.allFilesUnderPath(__dirname)).toContain('FileSystem.spec.ts');
    });
  });
});
