import path = require("path");

function parsePath(path_: string) {
  return path.parse(path_);
}

export function noteName(path_: string) {
  return parsePath(path_).name;
}
