export interface TimeProvider {
  currentTimeMs: () => number;
}

export const newTimeProvider = () => {
  return new DateTimeProvider();
};

class DateTimeProvider implements TimeProvider {
  public currentTimeMs = () => Date.now();
}
