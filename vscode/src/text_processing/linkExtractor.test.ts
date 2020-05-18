import { extractLinks } from "./linkExtractor";

describe('link extractor', () => {
  it('extracts 1 link', () => {
    const links = extractLinks('there is a [link](to/stuff) in here');

    expect(links).toEqual(['to/stuff']);
  });

  it('extracts multiple links', () => {
    const links = extractLinks('[link 1](hello) [link 2](yo)');

    expect(links).toEqual(['hello', 'yo']);
  });

  it('handles multiline', () => {
    const links = extractLinks('[link 1](hello)\n[link 2](yo)');

    expect(links).toEqual(['hello', 'yo']);
  });
});
