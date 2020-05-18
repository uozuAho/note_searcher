import { TimeProvider } from "../utils/timeProvider";

export class MockTimeProvider implements TimeProvider {
  private _currentTimeMs = 0;
  public setCurrentTimeMs = (timeMs: number) => this._currentTimeMs = timeMs;
  public millisecondsSinceEpochUtc = () => this._currentTimeMs;
}
