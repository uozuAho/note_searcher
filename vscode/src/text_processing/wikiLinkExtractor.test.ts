import { extractWikiLinks } from "./wikiLinkExtractor";

describe('findWikiLinkFilename', () => {
  it.each([
    ['simple [[link]]', ['link']],
    ['a [[hyphen-link]]', ['hyphen-link']],
    ['a [[link_with_extension.md]]', ['link_with_extension.md']],
    ['a [[ link_with_spaces ]]', ['link_with_spaces']],
    ['a [[piped | link]]', ['link']],
    ['a [[piped |link]]', ['link']],
    ['some [[multiple]] [[links]]', ['multiple', 'links']],
    ['some [[multiple]] [[blah | links]]', ['multiple', 'links']],
  ])('within "%s" finds "%s"', (text, expectedMatch) => {
    const actual = extractWikiLinks(text);
    expect(actual).toStrictEqual(expectedMatch);
  });

  it.each([
    ['no link'],
    ['empty [[]]'],
    ['[markdown](link)'],
  ])('finds no links in "%s"', (text) => {
    const actual = extractWikiLinks(text);
    expect(actual.length).toBe(0);
  });

  it('handles multiple links on the same line', () => {
    const actual = extractWikiLinks('a [[link]] and a [[second_link]]');
    expect(actual).toStrictEqual(['link', 'second_link']);
  });

  it('handles multiple lines', () => {
    const actual = extractWikiLinks('a [[link]] and \n a [[second_link]]');
    expect(actual).toStrictEqual(['link', 'second_link']);
  });
});
