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
        const dir = await getCurrentDir();
        // const results = await this.runCliSearch(query);
        // return `current dir: ${dir}\n` + results;
        return dir;
    };

    public index = async (indexDir: string) => {
        const dir = await getCurrentDir();
        const indexOutput = await this.runCliIndex(indexDir);
        return `current dir: ${dir}\n` + indexOutput;
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

    // private jar = () => process.env.NOTE_SEARCHER_DEV
    //     ? 'C:\\woz\\note_searcher2\\cli\\dist\\note_searcher.jar'
    //     : 'note_searcher.jar';

    private runJarCmd = (args: string) => `java -jar ${this.jarPath} ${args}`;
}

// const jar = () => 'C:\\woz\\note_searcher2\\cli\\dist\\note_searcher.jar';

const getCurrentDir = () => new Promise<string>((resolve, reject) => {
    child_process.exec('cd', (err, stdout) => {
        if (err) {
            reject(err);
        }
        resolve(stdout);
    });
});
