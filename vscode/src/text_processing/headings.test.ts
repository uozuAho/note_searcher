import { filenameToHeading } from "./headings";

describe('headings', () => {
  it.each([
    ['some_file.md', 'some file'],
  ])('from "%s", extracts "%s"', (filename, expectedHeading) => {
    expect(filenameToHeading(filename)).toBe(expectedHeading);
  });
});
