import { ITimeProvider } from "../utils/timeProvider";
import { IDiagnostics } from "./IDiagnostics";

export class ConsoleDiagnostics implements IDiagnostics {
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

export class NullDiagnostics implements IDiagnostics {
  public trace = (message: string) => {};
}
