import { TagIndex } from "../index/TagIndex";
import { VsCodeTagCompleter } from "./VsCodeTagCompleter";

export function createTagCompleter(tagsProvider: TagIndex) {
  return new VsCodeTagCompleter(tagsProvider);
}
