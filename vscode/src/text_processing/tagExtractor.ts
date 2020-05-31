export function extractTags(text: string): string[] {
  const matches = [];
  let currentMatch;
  // this is the dumbest thing ever written. Go javascript!
  // string.matchAll looks nicer, not available yet tho
  const regex = RegExp(/(\s|^)#([a-zA-Z0-9-]+)(?=\s|$|[!?.,])/gm);
  while ((currentMatch = regex.exec(text)) !== null) {
    matches.push(currentMatch[2].toString());
  }
  return matches;
}
