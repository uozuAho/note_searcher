import * as child_process from 'child_process';

export interface Searcher {
    search: (query: string) => Promise<string>;
    index: (dir: string) => Promise<string>;
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
        return await this.runCliSearch(query);
    };

    public index = async (indexDir: string) => {
        return await this.runCliIndex(indexDir);
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
