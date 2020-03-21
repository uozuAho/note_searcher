import * as child_process from 'child_process';
import { Uri } from 'vscode';

export interface Searcher {
    search: (query: string) => Promise<Uri[]>;
    index: (dir: string) => Promise<void>;
}

/**
 * @param jarPath location of the searcher java archive
 */
export const newCliSearcher = (jarPath: string): Searcher => {
    return new CliSearcher(jarPath);
};

class CliSearcher implements Searcher {
    public constructor(private jarPath: string) {}

    public search = async (query: string) => {
        const result = await this.runCliSearch(query);
        const lines = result.match(/[^\r\n]+/g);
        return lines
            ? lines.map(line => Uri.file(line))
            : [];
    };

    public index = async (indexDir: string) => {
        await this.runCliIndex(indexDir);
    };

    private runCliSearch = (query: string) => {
        const cmd = this.runJarCmd(`search "${query}"`);

        return new Promise<string>((resolve, reject) => {
            child_process.exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                resolve(stdout ? stdout : stderr);
            });
        });
    };

    private runCliIndex = (dir: string) => {
        const cmd = this.runJarCmd(`index ${dir}`);

        return new Promise<string>((resolve, reject) => {
            child_process.exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                resolve(stdout ? stdout : stderr);
            });
        });
    };

    private runJarCmd = (args: string) => `java -jar ${this.jarPath} ${args}`;
}
