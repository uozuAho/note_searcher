import * as tmoq from 'typemoq';

import { LunrSearch } from "./lunrSearch";
import { FileSystem } from "../utils/FileSystem";
import { File } from '../utils/File';
import { MockFile } from '../mocks/MockFile';


describe('lunr search', () => {
  let fileSystem: tmoq.IMock<FileSystem>;
  let lunrSearcher: LunrSearch;

  const setupFiles = (files: File[]) => {
    fileSystem.setup(w => w.allFilesUnderPath(tmoq.It.isAny()))
      .returns(() => files.map(f => f.path()));
    for (const file of files) {
      fileSystem.setup(r => r.readFile(file.path())).returns(() => file.text());
    }
  };

  beforeEach(() => {
    fileSystem = tmoq.Mock.ofType<FileSystem>();
    lunrSearcher = new LunrSearch(fileSystem.object);
  });

  it.only('searches', async () => {
    setupFiles([
      new MockFile('a/b', 'blah blah some stuff and things'),
      new MockFile('a/b/c', 'what about shoes and biscuits'),
    ]);

    lunrSearcher.index('some dir');
    const results = await lunrSearcher.search('blah');

    expect(results.length).toBe(1);
    expect(results[0]).toBe('a/b');
  });
});
