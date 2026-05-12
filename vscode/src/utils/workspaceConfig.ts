const _path = require('path');
import { IFileSystem } from "./IFileSystem";

export interface IWorkspaceConfig {
  ignore_paths_containing: string[];
  shouldIgnorePath: (path: string) => boolean;
}

export const defaultWorkspaceConfig = (): IWorkspaceConfig => ({
  ignore_paths_containing: ['node_modules', '.venv'],
  shouldIgnorePath: (path: string) =>
    ['node_modules', '.venv'].some(x => path.includes(x)),
});

const createWorkspaceConfig = (ignorePathsContaining: string[]): IWorkspaceConfig => ({
  ignore_paths_containing: ignorePathsContaining,
  shouldIgnorePath: (path: string) => ignorePathsContaining.some(x => path.includes(x)),
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
    return createWorkspaceConfig(config.ignore_paths_containing);
  } catch {
    return defaultWorkspaceConfig();
  }
};
