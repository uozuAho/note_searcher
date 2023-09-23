import { TagIndex } from "../index/TagIndex";
import { TagCompleter } from "./TagCompleter";
import { VsCodeTagCompleter } from "./VsCodeTagCompleter";

export function createTagCompleter(tagsProvider: TagIndex): TagCompleter {
  return new VsCodeTagCompleter(tagsProvider);
}
