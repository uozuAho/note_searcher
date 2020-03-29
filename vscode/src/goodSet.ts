export class GoodSet<T> extends Set<T> {
  public difference(other: GoodSet<T>): GoodSet<T> {
    const difference = new GoodSet(this);
    for (const elem of other) {
      difference.delete(elem);
    }
    return difference;
  }
}
