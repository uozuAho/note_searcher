import { LunrFullTextSearch } from './lunrFullTextSearch';

describe('lunr search: expand query tags', () => {
  const lunrSearch = new LunrFullTextSearch();

  it('replaces tag at the start of a query', () => {
    const inputQuery = '#tag';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe('tags:tag');
  });

  it('replaces tag in the middle of a query', () => {
    const inputQuery = 'hello #tag boy';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe('hello tags:tag boy');
  });

  it('replaces multiple tags', () => {
    const inputQuery = 'hello #tag #boy';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe('hello tags:tag tags:boy');
  });

  it('does not replace non tag', () => {
    const inputQuery = 'this is no#t a tag';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe(inputQuery);
  });

  it('works with operators', () => {
    const inputQuery = 'dont include this -#tag';
    const expandedQuery = lunrSearch.expandQueryTags(inputQuery);
    expect(expandedQuery).toBe('dont include this -tags:tag');
  });
});
