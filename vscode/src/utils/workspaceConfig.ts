const _path = require('path');
import { IFileSystem } from "./IFileSystem";

export interface IWorkspaceConfig {
  ignore_paths_containing: string[];
  shouldIgnorePath: (path: string) => boolean;
}

export const defaultWorkspaceConfig = (): IWorkspaceConfig => ({
  ignore_paths_containing: [],
  shouldIgnorePath: x => false,
});

export const loadWorkspaceConfig = (
  fs: IFileSystem,
  workspaceRoot: string
): IWorkspaceConfig => {
  try {
    const configPath = _path.join(workspaceRoot, '.notesearcher');
    const contents = fs.readFile(configPath);
    const config: IWorkspaceConfig = JSON.parse(contents);
    if (!config || !Array.isArray(config.ignore_paths_containing)) {
      return defaultWorkspaceConfig();
    }
    config.shouldIgnorePath = (path: string) =>
      config.ignore_paths_containing.some(x => path.includes(x));
    return config;
  } catch {
    return defaultWorkspaceConfig();
  }
};
