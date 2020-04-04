export class DelayedExecutor {
  private handles: NodeJS.Timeout[] = [];

  public executeInMs = (ms: number, func: any) => {
    this.handles.push(setTimeout(func, ms));
  };

  public cancelAll = () => {
    for (const handle of this.handles) {
      clearTimeout(handle);
    }
    this.handles = [];
  };
}
