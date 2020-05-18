import { formatDateTime_YYYYMMddhhmm } from "./timeFormatter";

describe('timeProvider', () => {

  describe('format time', () => {
    // todo: test corners
    // todo: test daylight savings
    // todo: use local time for note id
    it.each([
      [1588239219824, '202004300933'],
      [1577797200000, '201912311400'],
      [1577883599000, '202001011359'],
      [1609419599000, '202012311359'],
    ])('works', (epochMs: number, expectedOutput: string) => {
      const formattedTime = formatDateTime_YYYYMMddhhmm(epochMs);
      expect(formattedTime).toBe(expectedOutput);
    });
  });
});
