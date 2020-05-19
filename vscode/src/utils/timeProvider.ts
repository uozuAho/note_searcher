export interface TimeProvider {
  /**
   * Returns the number of milliseconds since 1970-01-01 00:00 UTC
   */
  millisecondsSinceEpochUtc: () => number;

  /**
   * Returns the number of milliseconds since 1970-01-01 00:00
   * in the local timezone.
   */
  millisecondsSinceEpochLocal: () => number;
}

export const createTimeProvider = () => {
  return new DateTimeProvider();
};

class DateTimeProvider implements TimeProvider {
  public millisecondsSinceEpochUtc = () => Date.now();

  public millisecondsSinceEpochLocal = () =>
    Date.now() - new Date().getTimezoneOffset() * 60 * 1000;
}
