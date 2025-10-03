import path = require("path");

export function updateLinks(oldPath: string, newPath: string, noteText: string) {
  const oldName = path.parse(oldPath).name;
  const newName = path.parse(newPath).name;
  return noteText.replace(/\[\[(.+?)\]\]/gm, (match, p1) => {
    let [left, right] = p1.split('|');

    if (right === undefined) {
      const regex = new RegExp(`(\\[\\[\\s*)${oldName}(\\s*\\]\\])`);
      return match.replace(regex, `$1${newName}$2`);
    } else {
      const regex = new RegExp(`(\\b\\s*)${oldName}(\\s*\\b)`);
      const newRight = right.replace(regex, `$1${newName}$2`);
      return `[[${left}|${newRight}]]`;
    }
  });
}
