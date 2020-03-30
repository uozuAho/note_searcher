import * as path from 'path';
import * as child_process from 'child_process';

export interface SearchService {
  search: (query: string) => Promise<string[]>;
  index: (dir: string) => Promise<void>;
}

/**
 * @param extensionDir location of this vscode extension's directory
 */
export const createService = (extensionDir: string): SearchService => {
  const jarPath = path.join(extensionDir, 'out/note_searcher.jar');
  return new CliSearcher(jarPath);
};

class CliSearcher implements SearchService {
  public constructor(private jarPath: string) {}

  public search = async (query: string) => {
    const result = await this.runCliSearch(query);
    const lines = result.match(/[^\r\n]+/g);
    return lines ? lines : [];
  };

  public index = async (indexDir: string) => {
    await this.runCliIndex(indexDir);
  };

  private runCliSearch = (query: string) => {
    return new Promise<string>((resolve, reject) => {
      // todo: make this async
      const result = child_process.spawnSync('java',
        ['-jar', this.jarPath, 'search', query]);
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
      const result = child_process.spawnSync('java',
        ['-jar', this.jarPath, 'index', dir]);
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
