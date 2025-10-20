import { IFullTextSearch } from './IFullTextSearch';
import { IFileSystem } from '../utils/IFileSystem';
import { IFile, SimpleFile } from '../utils/IFile';

export class MyFts implements IFullTextSearch {
  constructor(private fs: IFileSystem, private rootDir: string) {}

  public search = (query: string) => {
    return this.searchDir(this.rootDir, query);
  }

  private searchDir = async (dir: string, query: string) => {
    const docs: IFile[] = [];
    for (const path of this.fs.allFilesUnderPath(dir)) {
      if (path.endsWith('md') || path.endsWith('txt') || path.endsWith('log'))
      {
        const text = this.fs.readFile(path);
        docs.push(new SimpleFile(path, text));
      }
    }
    return this.searchDocs(docs, query);
  };

  private searchDocs = async (docs: IFile[], queryStr: string) => {
    const k1 = 1.5;
    const b = 0.75;

    const query = parseQuery(queryStr);

    var docStats = buildDocStats(docs, query);

    const N = docs.length;
    const paths = Array.from(docStats.docPaths());
    const myScores: number[] = [];

    // rank by bm25
    for (const path of paths) {
      let score = 0;
      const myTerms = query.mustHave.concat(query.other);
      for (const term of myTerms) {
        const f = docStats.docTermCount(path, term);
        if (f === 0) continue;
        const df = docStats.numDocsContaining(term);
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        const denom = f + k1 * (1 - b + b * (docStats.docLen(path) / docStats.AvgDocLen));
        score += idf * (f * (k1 + 1)) / denom;
      }
      myScores.push(score);
    }
    const myRanked = paths
      .map((path, i) => ({ path, score: myScores[i] }))
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(d => d.path)
      .slice(0, 20);

    return myRanked;
  }

  // no-ops to satisfy IFullTextSearch
  public addFile(path: string, text: string) {}
  public onFileModified = (path: string, text: string) => {
    return Promise.resolve();
  }
  public onFileDeleted = (path: string) => {
    return Promise.resolve();
  }
}

class Query {
  constructor(
    public mustHave: string[],
    public exclude: string[],
    public other: string[]
  ) { }
}

function parseQuery(query: string) {
  let queryTerms2 = query.split(' ');
  let mustIncludeTerms = queryTerms2
    .filter(t => t.startsWith("+"))
    .map(t => t.substring(1));
  let mustNotIncludeTerms = queryTerms2
    .filter(t => t.startsWith("-"))
    .map(t => t.substring(1));
  let plainTerms = queryTerms2
    .filter(t => !t.startsWith("+") && !t.startsWith("-"));

  return new Query(mustIncludeTerms, mustNotIncludeTerms, plainTerms);
}

class DocStats {
  public AvgDocLen = 0;

  // path: term: count
  private _termCounts: Map<string, Map<string, number>> = new Map();

  // path: len
  private _docLens: Map<string, number> = new Map();

  // term: numDocs
  private _docCounts: Map<string, number> = new Map();

  public docPaths() {
    return this._termCounts.keys();
  }

  public docTermCount(path: string, term: string) {
    return this._termCounts.get(path)?.get(term) || 0;
  }

  public containsDoc(path: string) {
    return this._termCounts.get(path) != undefined;
  }

  public numDocsContaining(term: string) {
    return this._docCounts.get(term) || 0;
  }

  public addTermCount(doc: string, term: string, count: number) {
    if (!this._termCounts.has(doc)) {
      this._termCounts.set(doc, new Map());
    }
    const counts = this._termCounts.get(doc);
    counts?.set(term, (counts.get(term) || 0) + count);

    // todo: prevent double counting?
    this._docCounts.set(term, (this._docCounts.get(term) || 0) + 1)
  }

  public removeDoc(path: string) {
    this._termCounts.delete(path);
  }

  public setDocLen(path: string, len: number) {
    this._docLens.set(path, len);
  }

  public docLen(path: string) {
    const len = this._docLens.get(path);
    if (len === undefined) {
      throw new Error(`doc len not stored: ${path}`);
    }
    return len;
  }
}

function buildDocStats(docs: IFile[], query: Query) {
  const stats = new DocStats();
  let docLenSum = 0;

  for (const doc of docs) {
    docLenSum += doc.text().length;
    let excludeDoc = false;
    for (const term of query.mustHave) {
      const regex = new RegExp(`\\b${term}s?\\b`, 'g');
      const count = (doc.text().match(regex) || []).length;
      if (count > 0) {
        stats.addTermCount(doc.path(), term, count);
      } else {
        excludeDoc = true;
        stats.removeDoc(doc.path());
        break;
      }
    }
    if (excludeDoc) {
      continue;
    }
    for (const term of query.exclude) {
      const regex = new RegExp(`\\b${term}s?\\b`, 'g');
      if (count(doc.text(), regex) > 0) {
        stats.removeDoc(doc.path());
        excludeDoc = true;
        break;
      }
    }
    if (excludeDoc) {
      continue;
    }
    for (const term of query.other) {
      const stemCount = countStemmed(doc.text(), term);
      if (stemCount > 0) {
        stats.addTermCount(doc.path(), term, stemCount);
      }
    }
    if (stats.containsDoc(doc.path())) {
      stats.setDocLen(doc.path(), doc.text().length);
    }
  }
  stats.AvgDocLen = docLenSum / docs.length;

  return stats;
}

function count(str: string, regex: RegExp) {
  return (str.match(regex) || []).length;
}

function countStemmed(docText: string, term: string) {
  // poor man's stemming
  // todo: perf: (maybe) combine regexes?
  let temp =
      count(docText, new RegExp(`\\b${term}s?\\b`, 'gi'))
    + count(docText, new RegExp(`\\b${term}ing\\b`, 'gi'))
    + count(docText, new RegExp(`\\b${term}ly\\b`, 'gi'))
  ;

  let lastLetter = term[term.length - 1];

  temp += count(docText, new RegExp(`\\b${term}${lastLetter}ing\\b`, 'gi'));
  temp += count(docText, new RegExp(`\\b${term}${lastLetter}er\\b`, 'gi'));

  if (term.endsWith('e')) {
    temp += count(docText, new RegExp(`\\b${term.slice(0, -1)}ing\\b`, 'gi'));
    temp += count(docText, new RegExp(`\\b${term}r\\b`, 'gi'));
  }
  if (term.endsWith('y')) {
    temp += count(docText, new RegExp(`\\b${term.slice(0, -1)}ier\\b`, 'gi'));
    temp += count(docText, new RegExp(`\\b${term.slice(0, -1)}iness\\b`, 'gi'));
    temp += count(docText, new RegExp(`\\b${term.slice(0, -1)}ily\\b`, 'gi'));
  }

  return temp;
}
