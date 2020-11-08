export function extractMarkdownLinks(text: string): string[] {
  const matches = [];
  let currentMatch;
  const regex = RegExp(/\[.*?\]\((.+?)\)/gm);
  while ((currentMatch = regex.exec(text)) !== null) {
    matches.push(currentMatch[1].toString());
  }
  return matches;
}
