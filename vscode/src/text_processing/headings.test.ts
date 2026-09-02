import { filenameToHeading } from "./headings";

describe('headings', () => {
  it.each([
    ['some_file.md', 'some file'],
    ['some-file.md', 'some file'],
    ['some-file.log.md', 'some file log'],
  ])('from "%s", extracts "%s"', (filename, expectedHeading) => {
    expect(filenameToHeading(filename)).toBe(expectedHeading);
  });
});
