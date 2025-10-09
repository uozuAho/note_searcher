import { ITimeProvider, createTimeProvider } from "../utils/timeProvider";

export interface IDiagnostics {
  trace: (message: string) => void;
}

export const createDiagnostics = (
  label: string,
  timeProvider: ITimeProvider = createTimeProvider()) =>
{
  return new ConsoleDiagnostics(label, timeProvider);
  // return new NullDiagnostics();
};

class ConsoleDiagnostics implements IDiagnostics {
  private start: number;

  constructor(
    private label: string,
    private timeProvider: ITimeProvider)
  {
    this.start = timeProvider.millisecondsSinceEpochUtc();
  }

  public trace = (message: string) => {
    const now_ms = this.timeProvider.millisecondsSinceEpochUtc() - this.start;
    const now_s = now_ms / 1000;

    console.log(`${now_s}: ${this.label}: ${message}`);
  };
}

class NullDiagnostics implements IDiagnostics {
  public trace = (message: string) => {};
}
