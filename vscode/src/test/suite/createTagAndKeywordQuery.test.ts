import * as assert from 'assert';
import { createTagAndKeywordQuery } from '../../createTagAndKeywordQuery';

suite('createTagAndKeywordQuery', () => {
  test('creates query', () => {
    const tags = ['a', 'b', 'c'];
    const keywords = ['d', 'e'];

    const query = createTagAndKeywordQuery(tags, keywords);

    assert.equal(query, '#a #b #c d e');
  });

  test('removes overlapping keywords', () => {
    const tags = ['a', 'b', 'c'];
    const keywords = ['c', 'd'];

    const query = createTagAndKeywordQuery(tags, keywords);

    assert.equal(query, '#a #b #c d');
  });
});
