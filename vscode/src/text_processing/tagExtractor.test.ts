import { extractTags } from './tagExtractor';

describe('extractTags', () => {
  it('extracts single tag', () => {
    const tags = extractTags('meat pie #change');
    expect(tags).toEqual(['change']);
  });

  it('extracts multiple tags', () => {
    const tags = extractTags('meat pie #change and #stuff');
    expect(tags).toEqual(['change', 'stuff']);
  });

  it('extracts consecutive tags', () => {
    const tags = extractTags('#a #b #c');
    expect(tags).toEqual(['a', 'b', 'c']);
  });

  it('extracts hyphenated tag', () => {
    const tags = extractTags('#meat-pie');
    expect(tags).toEqual(['meat-pie']);
  });

  it('does not extract underscored tag', () => {
    const tags = extractTags('#meat_pie');
    expect(tags).toEqual([]);
  });

  it('extracts tag at start of line', () => {
    const tags = extractTags('#blub nub nub');
    expect(tags).toEqual(['blub']);
  });

  it('extracts tag at end of line', () => {
    const tags = extractTags('nub nub #blub\ncheese');
    expect(tags).toEqual(['blub']);
  });

  it.each(['.', '?', ',', '!'])
  ('extracts tag before a %s', (char) => {
    const tags = extractTags(`nub nub #blub${char} cheese`);
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
