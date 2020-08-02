import * as child_process from 'child_process';

import { NoteIndex } from './NoteIndex';

export class CliNoteIndex implements NoteIndex {

  public constructor(private jarPath: string) { }
  
  public linksTo(path: string): string[] {
    throw new Error("Method not implemented.");
  }

  public search = async (query: string) => {
    const result = await this.runCliSearch(query);
    const lines = result.match(/[^\r\n]+/g);
    return lines ? lines : [];
  };

  public index = async (indexDir: string) => {
    await this.runCliIndex(indexDir);
  };

  public allTags = () => { throw new Error('not implemented!'); };

  public notes(): IterableIterator<string> {
    throw new Error("Method not implemented.");
  }

  public containsNote(path: string): boolean {
    throw new Error("Method not implemented.");
  }

  public linksFrom(path: string): string[] {
    throw new Error("Method not implemented.");
  }

  private runCliSearch = (query: string) => {
    return new Promise<string>((resolve, reject) => {
      // todo: make this async
      const result = child_process.spawnSync('java', ['-jar', this.jarPath, 'search', query]);
      if (result.error) {
        reject(result.error);
      }
      const stderr = new String(result.stderr).toString();
      if (stderr) {
        reject(stderr);
      }
      const stdout = new String(result.stdout).toString();
      resolve(stdout ? stdout : stderr);
    });
  };

  private runCliIndex = (dir: string) => {
    return new Promise<string>((resolve, reject) => {
      // todo: make this async
      const result = child_process.spawnSync('java', ['-jar', this.jarPath, 'index', dir]);
      if (result.error) {
        reject(result.error);
      }
      const stderr = new String(result.stderr).toString();
      if (stderr) {
        reject(stderr);
      }
      const stdout = new String(result.stdout).toString();
      resolve(stdout ? stdout : stderr);
    });
  };
}
