import { GoodSet } from '../utils/goodSet';

function assertIsSameSet<T>(a: GoodSet<T>, b: GoodSet<T>) {
  const avals = Array.from(a.values());
  const bvals = Array.from(b.values());

  expect(avals).toEqual(bvals);
}

describe('GoodSet', () => {
  describe('difference', () => {
    it('removes single value', () => {
      const a = new GoodSet([1, 2 ,3]);
      const b = new GoodSet([3]);

      assertIsSameSet(a.difference(b), new GoodSet([1, 2]));
    });

    it('removes multiple values', () => {
      const a = new GoodSet([1, 2 ,3]);
      const b = new GoodSet([2, 3]);

      assertIsSameSet(a.difference(b), new GoodSet([1]));
    });

    it('does not remove missing value', () => {
      const a = new GoodSet([1, 2 ,3]);
      const b = new GoodSet([4]);

      assertIsSameSet(a.difference(b), new GoodSet([1, 2, 3]));
    });
  });
});
