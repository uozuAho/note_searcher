import { GoodSet } from "./goodSet";

export const createTagAndKeywordQuery = (
  tags: string[], keywords: string[]) =>
{
  const keywordsMinusTags =
    Array.from(
      new GoodSet(keywords).difference(new GoodSet(tags))
    );
  const tagsWithHashes = tags.map(tag => '#' + tag);
  return tagsWithHashes.concat(keywordsMinusTags).join(' ');
};
