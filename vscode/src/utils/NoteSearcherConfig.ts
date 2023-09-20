import _path = require('path');
import { FileSystem } from './FileSystem';

export interface NoteSearcherConfig {
  isIgnored: (path: string) => boolean;
}

interface RawNoteSearcherConfig {
  ignore: string[];
}

class DefaultRawNoteSearcherConfig implements RawNoteSearcherConfig {
  public ignore: string[] = ['node_modules'];
}

export class NoteSearcherConfigImpl implements NoteSearcherConfig {
  private constructor(private _rawConfig: RawNoteSearcherConfig) {}

  public static fromWorkspace(workspaceDir: string, fs: FileSystem) {
    const optionsFilePath = _path.join(workspaceDir, '.noteSearcher.config.json');

    if (fs.fileExists(optionsFilePath)) {
      return NoteSearcherConfigImpl.fromJson(fs.readFile(optionsFilePath), workspaceDir);
    }

    return new NoteSearcherConfigImpl(new DefaultRawNoteSearcherConfig());
  }

  private static fromJson(json: string, workspaceDir: string) {
    let config = JSON.parse(json) as RawNoteSearcherConfig;
    config.ignore.push('node_modules');
    return new NoteSearcherConfigImpl(config);
  }

  public isIgnored = (path: string) => {
    return any(this._rawConfig.ignore, i => path.replace(/\\/g, '/').includes(i));
  };
}

function any(arr: any[], predicate: (a: any) => boolean) {
  for (const item of arr) {
    if (predicate(item)) {
      return true;
    }
  }
  return false;
}
