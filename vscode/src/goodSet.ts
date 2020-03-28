export class GoodSet<T> extends Set<T> {
  public difference(other: Set<T>): Set<T> {
    const difference = new Set(this);
    for (const elem of other) {
      difference.delete(elem);
    }
    return difference;
  }
}
