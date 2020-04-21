import { FullTextSearch } from "./FullTextSearch";

export class LunrSearch implements FullTextSearch {
  search = (query: string) => Promise.resolve([]);
  index = (dir: string) => Promise.resolve();
}
