import { findWikiLinkFilename } from "./wikiLinkExtractor";

describe('findWikiLinkFilename', () => {
  it.each([
    ['simple [[link]]', 'link'],
    ['a [[hyphen-link]]', 'hyphen-link'],
    ['a [[link_with_extension.md]]', 'link_with_extension.md'],
    ['a [[ link_with_spaces ]]', 'link_with_spaces'],
    ['a [[piped | link]]', 'link'],
    ['a [[piped |link]]', 'link'],
    ['no link', null],
    ['empty [[]]', null],
    ['[markdown](link)', null],
  ])('within "%s" finds "%s"', (text, expectedMatch) => {
    const actual = findWikiLinkFilename(text);
    expect(actual).toBe(expectedMatch);
  });

  it.each([
    ['no link', null],
    ['empty [[]]', null],
    ['[markdown](link)', null],
  ])('finds no links in "%s"', (text, expectedMatch) => {
    const actual = findWikiLinkFilename(text);
    expect(actual).toBe(expectedMatch);
  });
});
