import path = require("path");

export function updateLinks(oldPath: string, newPath: string, noteText: string) {
  const oldName = path.parse(oldPath).name;
  const newName = path.parse(newPath).name;
  return noteText.replace(/\[\[(.+?)\]\]/gm, (match, p1) => {
    let [left, right] = p1.split('|');

    if (!match.includes(oldName)) {
      return match;
    }

    if (right === undefined) {
      if (left.trim() === oldName) {
        return match.replace(oldName, newName);
      }
    } else {
      if (right.trim() === oldName) {
        return `[[${left}|${right.replace(oldName, newName)}]]`;
      }
    }

    return match;
  });
}
