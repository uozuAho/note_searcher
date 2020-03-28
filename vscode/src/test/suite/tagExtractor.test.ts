import * as assert from 'assert';
import { extractTags } from '../../tagExtractor';

suite('extractTags', () => {
  test('extracts single tag', () => {
    const tags = extractTags('meat pie #change');
    assert.deepEqual(tags, ['#change']);
  });

  test('extracts multiple tags', () => {
    const tags = extractTags('meat pie #change and #stuff');
    assert.deepEqual(tags, ['#change', '#stuff']);
  });
});
