import { TimeProvider, createTimeProvider } from "../utils/timeProvider";

export interface Diagnostics {
  trace: (message: string) => void;
}

export const createDiagnostics = (
  label: string,
  timeProvider: TimeProvider = createTimeProvider()) =>
{
  // todo: config
  // return new ConsoleDiagnostics(label, timeProvider);
  return new NullDiagnostics();
};

class ConsoleDiagnostics implements Diagnostics {
  private start: number;

  constructor(
    private label: string,
    private timeProvider: TimeProvider)
  {
    this.start = timeProvider.millisecondsSinceEpochUtc();
  }

  public trace = (message: string) => {
    const now_ms = this.timeProvider.millisecondsSinceEpochUtc() - this.start;
    const now_s = now_ms / 1000;

    console.log(`${now_s}: ${this.label}: ${message}`);
  };
}

class NullDiagnostics implements Diagnostics {
  public trace = (message: string) => {};
}
