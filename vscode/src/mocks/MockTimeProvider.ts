import { ITimeProvider } from "../utils/timeProvider";

export class MockTimeProvider implements ITimeProvider {
  private _currentTimeMs = 0;
  public setCurrentTimeMs = (timeMs: number) => this._currentTimeMs = timeMs;
  public millisecondsSinceEpochUtc = () => this._currentTimeMs;
  public millisecondsSinceEpochLocal = () => 0;
}
