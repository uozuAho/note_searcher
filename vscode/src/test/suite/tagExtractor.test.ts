import * as assert from 'assert';
import { extractTags } from '../../tagExtractor';

suite('tag extractor', () => {
  test('Sample test', () => {
    const tags = extractTags('meat pie #change');
    assert.equal(tags, ['#change']);
  });
});
