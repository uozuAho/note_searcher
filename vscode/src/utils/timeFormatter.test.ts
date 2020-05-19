import { formatDateTime_YYYYMMddhhmm } from "./timeFormatter";

describe('timeProvider', () => {

  describe('format time', () => {
    it.each([
      [1588239219824, '202004300933'], // covers AEDT (UTC+11)
      [1577836799000, '201912312359'],
      [1577836800000, '202001010000'],
      [1591012800000, '202006011200'], // covers AEST (UTC+10)
    ])('formats %d to %s UTC', (epochMs: number, expectedOutput: string) => {
      const formattedTime = formatDateTime_YYYYMMddhhmm(epochMs);
      expect(formattedTime).toBe(expectedOutput);
    });
  });
});
