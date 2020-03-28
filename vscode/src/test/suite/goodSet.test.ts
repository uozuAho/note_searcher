import * as assert from 'assert';
import { GoodSet } from '../../goodSet';

suite('GoodSet', () => {
  suite('difference', () => {
    test('removes single value', () => {
      const a = new GoodSet([1, 2 ,3]);
      const b = new GoodSet([3]);

      assert.deepEqual(a.difference(b), new GoodSet([1, 2]));
    });

    test('removes multiple values', () => {
      const a = new GoodSet([1, 2 ,3]);
      const b = new GoodSet([2, 3]);

      assert.deepEqual(a.difference(b), new GoodSet([1]));
    });

    test('does not remove missing value', () => {
      const a = new GoodSet([1, 2 ,3]);
      const b = new GoodSet([4]);

      assert.deepEqual(a.difference(b), new GoodSet([1, 2, 3]));
    });
  });
});
