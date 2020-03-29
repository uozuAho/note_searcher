import { createTagAndKeywordQuery } from '../../createTagAndKeywordQuery';

describe('createTagAndKeywordQuery', () => {
  it('creates query', () => {
    const tags = ['a', 'b', 'c'];
    const keywords = ['d', 'e'];

    const query = createTagAndKeywordQuery(tags, keywords);

    expect(query).toEqual('#a #b #c d e');
  });

  it('removes overlapping keywords', () => {
    const tags = ['a', 'b', 'c'];
    const keywords = ['c', 'd'];

    const query = createTagAndKeywordQuery(tags, keywords);

    expect(query).toEqual('#a #b #c d');
  });
});
