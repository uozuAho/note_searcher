import { GoodSet } from "../utils/goodSet";

export interface TagIndex {
  allTags: () => string[];
}

export class TagSet implements TagIndex {
  private _tagsIndex: GoodSet<string> = new GoodSet();

  public addTags = (tags: string[]) => {
    tags.forEach(t => this._tagsIndex.add(t));
  };

  public allTags = () => {
    return Array.from(this._tagsIndex.values());
  };

  public clear = () => {
    this._tagsIndex.clear();
  };
}
