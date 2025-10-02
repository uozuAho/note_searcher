import { updateLinks } from "./wikilinkUpdater";

describe('wikilink text updater', () => {
  it.each([
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[cat]]", "[[dog]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[ cat ]]", "[[ dog ]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "cat", "cat"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[cats]]", "[[cats]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[my note about cats | cat]]", "[[my note about cats | dog]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt",
      `Multiline note [[about cats | cat]]
      hey ho [[cats]]
      [[cat]]`,
      `Multiline note [[about cats | dog]]
      hey ho [[cats]]
      [[dog]]`]
  ])('oldPath: %s, newPath: %s, oldText: %s, expectedText: %s',
    (oldPath, newPath, noteText, expectedText) => {
      const newText = updateLinks(oldPath, newPath, noteText);
      expect(newText).toBe(expectedText);
    });
});
