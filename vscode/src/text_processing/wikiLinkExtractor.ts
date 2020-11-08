export const createWikiLinkFilenameRegex = () => /\[\[.+?\]\]/;

export function findWikiLinkFilename(text: string): string | null {
  const match = extract(createWikiLinkFilenameRegex(), text);

  if (!match) {
    return null;
  }

  return extractFilenameFromWikiLink(match);
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
