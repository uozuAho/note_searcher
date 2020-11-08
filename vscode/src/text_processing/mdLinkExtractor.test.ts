import { extractMarkdownLinks } from "./mdLinkExtractor";

describe('markdown link extractor', () => {
  it('extracts 1 link', () => {
    const links = extractMarkdownLinks('there is a [link](to/stuff) in here');

    expect(links).toEqual(['to/stuff']);
  });

  it('extracts multiple links', () => {
    const links = extractMarkdownLinks('[link 1](hello) [link 2](yo)');

    expect(links).toEqual(['hello', 'yo']);
  });

  it('handles multiline', () => {
    const links = extractMarkdownLinks('[link 1](hello)\n[link 2](yo)');

    expect(links).toEqual(['hello', 'yo']);
  });
});
