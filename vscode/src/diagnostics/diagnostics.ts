import { TimeProvider, newTimeProvider } from "../utils/timeProvider";

export interface Diagnostics {
  trace: (message: string) => void;
}

export const newDiagnostics = (
  label: string,
  timeProvider: TimeProvider = newTimeProvider()) =>
{
  // todo: config
  return new ConsoleDiagnostics(label, timeProvider);
  // return new NullDiagnostics();
};

class ConsoleDiagnostics implements Diagnostics {
  constructor(
    private label: string,
    private timeProvider: TimeProvider) {}

  public trace = (message: string) => {
    const now = this.timeProvider.currentTimeMs();

    console.log(`${now}: ${this.label}: ${message}`);
  };
}

class NullDiagnostics implements Diagnostics {
  public trace = (message: string) => {};
}
