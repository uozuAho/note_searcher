export function filenameToHeading(filename: string) {
  return filename.replace(/\.md$/, '').replace(/[-_.]/g, ' ').trim();
}
