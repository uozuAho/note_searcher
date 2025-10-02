import { updateLinks } from "./wikilinkTextUpdater";

describe('wikilink text updater', () => {
  it('asdf', () => {
    const oldPath = "/a/b/cat.txt";
    const newPath = "/a/b/dog.txt";
    const noteText = "My note. [[cat]].";

    const newText = updateLinks(oldPath, newPath, noteText);

    expect(newText).toBe("My note. [[dog]].");
  });
});
