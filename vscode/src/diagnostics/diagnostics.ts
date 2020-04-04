import { TimeProvider, newTimeProvider } from "../utils/timeProvider";

export interface Diagnostics {
  trace: (message: string) => void;
}

export const newDiagnostics = (
  label: string,
  timeProvider: TimeProvider = newTimeProvider()) =>
{
  return new ConsoleDiagnostics(label, timeProvider);
};

class ConsoleDiagnostics {
  constructor(
    private label: string,
    private timeProvider: TimeProvider) {}

  public trace = (message: string) => {
    const now = this.timeProvider.currentTimeMs();

    console.log(`${now}: ${this.label}: ${message}`);
  };
}
