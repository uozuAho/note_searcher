export interface TimeProvider {
  /**
   * Returns the current epoch time in milliseconds.
   * Epoch time is time since 1970-01-01 00:00 UTC.
   */
  millisecondsSinceEpochUtc: () => number;
}

export const createTimeProvider = () => {
  return new DateTimeProvider();
};

class DateTimeProvider implements TimeProvider {
  public millisecondsSinceEpochUtc = () => Date.now();
}
