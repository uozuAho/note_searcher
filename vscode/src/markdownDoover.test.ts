import { findWikiLinkFilename } from "./markdownDoover";

describe('findWikiLinkFilename', () => {
  it.each([
    'simple [[link]]', '[[link]]'
  ])('finds %s in %s', (expectedMatch, text) => {
    const actual = findWikiLinkFilename(text);
    expect(actual).toBe(expectedMatch);
  });
});
