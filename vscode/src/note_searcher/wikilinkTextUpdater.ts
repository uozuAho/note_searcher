import path = require("path");

export function updateLinks(
  oldPath: string,
  newPath: string,
  noteText: string
) : string
{
  const oldFilename = path.parse(oldPath).name;
  const newFilename = path.parse(newPath).name;
  return noteText.replace(oldFilename, newFilename);
}
