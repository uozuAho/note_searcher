import { formatDateTime_YYYYMMddhhss } from "./timeFormatter";

describe('timeProvider', () => {

  describe('format time', () => {
    // note: these probably only work in AEST
    it.each([
      [1588239219824, '202004301933'],
      [1577797200000, '202001010000'],
      [1577883599000, '202001012359'],
      [1609419599000, '202012312359'],
    ])('works', (epochMs: number, expectedOutput: string) => {
      const formattedTime = formatDateTime_YYYYMMddhhss(epochMs);
      expect(formattedTime).toBe(expectedOutput);
    });
  });
});
