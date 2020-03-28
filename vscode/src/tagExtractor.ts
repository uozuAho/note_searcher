export function extractTags(text: string): string[] {
  // todo: use RegExp.prototype.exec() to get capture group 1
  const matches = text.match(/(\s|^)(#.+?)\b/gm);

  if (!matches) { return []; }

  console.log(matches);

  return matches;
}
