import * as tmoq from "typemoq";
import { DeadLinkFinder } from "./DeadLinkFinder";
import { MockFile } from "../mocks/MockFile";
import { FileSystem } from "../utils/FileSystem";
import { File } from "../utils/File";

describe('DeadLinkFinder', () => {
  let fileSystem: tmoq.IMock<FileSystem>;
  let finder: DeadLinkFinder;

  const setupDir = (files: File[]) => {
    fileSystem.setup(w => w.allFilesUnderPath(tmoq.It.isAny()))
      .returns(() => files.map(f => f.path()));
    for (const file of files) {
      fileSystem.setup(r => r.readFile(file.path())).returns(() => file.text());
    }
  };

  beforeEach(() => {
    fileSystem = tmoq.Mock.ofType<FileSystem>();

    finder = new DeadLinkFinder(fileSystem.object);
  });

  it('finds dead links', () => {
    const fileWithDeadLink = new MockFile('/stuff.txt', '[link](/to/nowhere)');
    setupDir([fileWithDeadLink]);
    fileSystem.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => false);

    // act
    const deadLinks = finder.findDeadLinks('some dir');

    // assert
    expect(deadLinks.length).toBe(1);
    const deadLink = deadLinks[0];
    expect(deadLink.sourcePath).toBe(fileWithDeadLink.path());
    expect(deadLink.targetPath).toBe('/to/nowhere');
  });

  it('returns empty when all links are good', () => {
    setupDir([
      new MockFile('/me/file1.txt', '[](asdf)'),
      new MockFile('/me/file2.txt', '[](qwer)'),
    ]);
    fileSystem.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => true);

    // act
    const deadLinks = finder.findDeadLinks('dont care');

    // assert
    expect(deadLinks.length).toBe(0);
  });

  it('handles empty dir', () => {
    setupDir([]);

    const deadLinks = finder.findDeadLinks('dont care');

    expect(deadLinks.length).toBe(0);
  });

  it('ignores links starting with http', () => {
    setupDir([
      new MockFile('/me/file1.txt', '[link](https://www.stuff.com)'),
    ]);
    fileSystem.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => false);

    const deadLinks = finder.findDeadLinks('dont care');

    expect(deadLinks.length).toBe(0);
  });

  it('handles links to non-text files', () => {
    setupDir([
      new MockFile('a_file.txt', '[link](/some/non/text/file)'),
    ]);
    fileSystem.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => true);

    const deadLinks = finder.findDeadLinks('dont care');

    expect(deadLinks.length).toBe(0);
  });

  // absolute = from workspace root directory
  it('handles "absolute" links', () => {
    const root = '/some/root/dir';
    setupDir([
      new MockFile('a_file.txt', '[link](/to/another/file)'),
    ]);
    fileSystem.setup(r => r.fileExists(`${root}/to/another/file`)).returns(() => true);
    fileSystem.setup(r => r.fileExists('/to/another/file')).returns(() => false);

    // act
    const deadLinks = finder.findDeadLinks(root);

    // assert
    expect(deadLinks.length).toBe(0);
  });

  it('handles relative links', () => {
    const root = '/some/root/dir';
    setupDir([
      new MockFile(`${root}/mydir/a_file.txt`, '[link](b_file.txt)'),
    ]);
    fileSystem.setup(r => r.fileExists(`${root}/mydir/b_file.txt`)).returns(() => true);

    // act
    const deadLinks = finder.findDeadLinks(root);

    // assert
    expect(deadLinks.length).toBe(0);
  });

  // note: vscode doesn't hyperlink to paths with spaces :(
  it('handles paths with spaces', () => {
    const root = '/some/root dir';
    setupDir([
      new MockFile(`${root}/my dir/a_file.txt`, '[link](b_file.txt)'),
    ]);
    fileSystem.setup(r => r.fileExists(`${root}/my dir/b_file.txt`)).returns(() => true);

    // act
    const deadLinks = finder.findDeadLinks(root);

    // assert
    expect(deadLinks.length).toBe(0);
  });

  it.each(['md', 'txt', 'log'])('cares about %s files', (ext) => {
    const fileWithDeadLink = new MockFile(`stuff.${ext}`, '[dead link](/to/nowhere)');
    setupDir([fileWithDeadLink]);
    fileSystem.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => false);

    expect(finder.findDeadLinks('some path').length).toBe(1);
  });

  // just some examples, but really, any extension except the above
  it.each(['py', 'html', 'sh'])('ignores %s files', (ext) => {
    const fileWithDeadLink = new MockFile(`stuff.${ext}`, '[dead link](/to/nowhere)');
    setupDir([fileWithDeadLink]);
    fileSystem.setup(r => r.fileExists(tmoq.It.isAny())).returns(() => false);

    expect(finder.findDeadLinks('some path').length).toBe(0);
  });
});
