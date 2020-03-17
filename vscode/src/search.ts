import * as child_process from 'child_process';

export interface Searcher {
    search: (query: string) => Promise<string>;
    index: (dir: string) => void;
}

export const newSearcher = (): Searcher => {
    return new CliSearcher();
}

class CliSearcher implements Searcher {
    private jar = 'C:\\woz\\note_searcher2\\cli\\dist\\note_searcher.jar';

    public search = (query: string) => {
        const cmd = `java -jar ${this.jar} search "${query}"`;

        return new Promise<string>((resolve, reject) => {
            child_process.exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                resolve(stdout ? stdout : stderr);
            });
        })
    }

    public index = (dir: string) => {
        const cmd = `java -jar ${this.jar} index ${dir}`;
        child_process.exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
            }
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
        });
    }
}
