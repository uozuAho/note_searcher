export const createWikiLinkRegex = () => /\[\[.+?\]\]/;

export function extractWikiLinks(text: string): string[] {
  const matches = extractAll(/\[\[.+?\]\]/gm, text);

  return matches.map(m => extractFilenameFromWikiLink(m.toString()));
}

/**
 * @param text a wikilink. May be piped, eg [[this]], [[or | this]]
 */
export function extractFilenameFromWikiLink(text: string): string {
  if (!text.includes('|')) {
    return removeWikiLinkBrackets(text).trim();
  }
  else {
    return extractFilenameFromPipedLink(text);
  }
}

function removeWikiLinkBrackets(text: string) {
  return text.substr(2, text.length - 4).trim();
}

function extractFilenameFromPipedLink(text: string) {
  const match = extract(/\|.+?\]/, text);
  if (!match) {
    throw Error('must find text in piped wikilink');
  }
  return match.substr(1, match.length - 2).trim();
}

function extract(regex: RegExp, text: string): string | null {
  const matches = regex.exec(text);
  if (!matches) {
    return null;
  }
  return matches[0];
}

function extractAll(regex: RegExp, text: string): RegExpExecArray[] {
  const matches = [];
  let currentMatch;
  while ((currentMatch = regex.exec(text)) !== null) {
    matches.push(currentMatch);
  }
  return matches;
}
