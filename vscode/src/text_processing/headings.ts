export function filenameToHeading(filename: string) {
  return filename.replace(/_/g, ' ').replace('.md', '').trim();
}
