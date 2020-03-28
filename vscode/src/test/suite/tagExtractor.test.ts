import * as assert from 'assert';
import { extractTags } from '../../tagExtractor';

suite('extractTags', () => {
  test('extracts single tag', () => {
    const tags = extractTags('meat pie #change');
    assert.deepEqual(tags, ['change']);
  });

  test('extracts multiple tags', () => {
    const tags = extractTags('meat pie #change and #stuff');
    assert.deepEqual(tags, ['change', 'stuff']);
  });

  test('extracts tag at start', () => {
    const tags = extractTags('#blub nub nub');
    assert.deepEqual(tags, ['blub']);
  });

  test('does not extract non-tag', () => {
    const tags = extractTags('this is no#t a tag');
    assert.deepEqual(tags, []);
  });

  test('does not extract 0-length tags', () => {
    const tags = extractTags('# # beef #boop');
    assert.deepEqual(tags, ['boop']);
  });
});
