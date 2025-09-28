import { ITagIndex } from "../index/TagIndex";
import { VsCodeTagCompleter } from "./VsCodeTagCompleter";

export function createTagCompleter(tagsProvider: ITagIndex) {
  return new VsCodeTagCompleter(tagsProvider);
}
