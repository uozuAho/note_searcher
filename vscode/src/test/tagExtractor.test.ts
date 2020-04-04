import { extractTags } from '../text_processing/tagExtractor';

describe('extractTags', () => {
  it('extracts single tag', () => {
    const tags = extractTags('meat pie #change');
    expect(tags).toEqual(['change']);
  });

  it('extracts multiple tags', () => {
    const tags = extractTags('meat pie #change and #stuff');
    expect(tags).toEqual(['change', 'stuff']);
  });

  it('extracts tag at start', () => {
    const tags = extractTags('#blub nub nub');
    expect(tags).toEqual(['blub']);
  });

  it('does not extract non-tag', () => {
    const tags = extractTags('this is no#t a tag');
    expect(tags).toEqual([]);
  });

  it('does not extract 0-length tags', () => {
    const tags = extractTags('# # beef #boop');
    expect(tags).toEqual(['boop']);
  });
});
