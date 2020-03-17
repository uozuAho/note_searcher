import * as child_process from 'child_process';

export interface Searcher {
    search: (query: string) => Promise<string>;
}

export const newSearcher = (): Searcher => {
    return new CliSearcher();
}

class CliSearcher implements Searcher {
    public search = (query: string) => {
        const jar = 'C:\\woz\\note_searcher2\\cli\\dist\\note_searcher.jar';
        const cmd = `java -jar ${jar} search "${query}"`;

        return new Promise<string>((resolve, reject) => {
            child_process.exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                resolve(stdout ? stdout : stderr);
            });
        })
    }
}
