import { updateLinks } from "./wikilinkUpdater";

describe('wikilink text updater', () => {
  it.each([
    ["/a/b/cat.txt", "/a/b/dog.txt", "", ""],
    ["/a/b/cat.txt", "/a/b/cat.txt", "[[cat]]", "[[cat]]"],
    ["/a/b/cat.txt", "/a/b/CAT.txt", "[[cat]]", "[[CAT]]"],
    ["/a/b/cat.txt", "/a/b/cat.txt", "[[my asdf |cat]]", "[[my asdf |cat]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[cat]]", "[[dog]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[cat|and|cat]]", "[[cat|and|cat]]"], // not a valid link - max one pipe allowed
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[dir/cat]]", "[[dir/cat]]"], // not a valid link - must be filename only
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[cat cat]]", "[[cat cat]]"], // not a valid link - can't have whitespace
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[my | cat cat]]", "[[my | cat cat]]"], // not a valid link - can't have whitespace
    ["/a/b/a.b.txt", "/a/b/a_b.txt", "[[a.b]]", "[[a_b]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[ cat ]]", "[[ dog ]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "cat", "cat"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "unrelated", "unrelated"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[cats]]", "[[cats]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[my cat | cat]]", "[[my cat | dog]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[my cats | cat]]", "[[my cats | dog]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[my note about cats|cat]]", "[[my note about cats|dog]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[unrelated | note]]", "[[unrelated | note]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[unrelated | cats]]", "[[unrelated | cats]]"],
    ["/a/b/cat.txt", "/a/b/dog.txt",
      "[[not a link to cat or anything]]", "[[not a link to cat or anything]]"],

    ["/a/b/cat.txt", "/a/b/dog.txt",
      "[[also not a link to cat | or anything]]", "[[also not a link to cat | or anything]]"],

    ["/a/b/cat.txt", "/a/b/dog.txt",
      `Multiline note [[about cats | cat]]
      hey ho [[cats]]
      [[cat]]`,
      `Multiline note [[about cats | dog]]
      hey ho [[cats]]
      [[dog]]`],

    ["/a/b/cat.txt", "/a/b/dog.txt",
      `Hey ho multiline, sometimes I like to type [[ but this
      should ]] not be interpreted as a link.`,
      `Hey ho multiline, sometimes I like to type [[ but this
      should ]] not be interpreted as a link.`],

    // nested links not supported
    ["/a/b/cat.txt", "/a/b/dog.txt", "[[my [[cat]] yeah]]", "[[my [[cat]] yeah]]"],
  ])('oldPath: %s, newPath: %s, oldText: %s, expectedText: %s',
    (oldPath, newPath, noteText, expectedText) => {
      const newText = updateLinks(oldPath, newPath, noteText);
      expect(newText).toBe(expectedText);
    });
});
