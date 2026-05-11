const _path = require('path');
import { IFileSystem } from "./IFileSystem";

export interface WorkspaceConfig {
  ignore_paths_containing: string[];
}

export const defaultWorkspaceConfig = (): WorkspaceConfig => ({
  ignore_paths_containing: [],
});

export const loadWorkspaceConfig = (
  fs: IFileSystem,
  workspaceRoot: string
): WorkspaceConfig => {
  try {
    const configPath = _path.join(workspaceRoot, '.notesearcher');
    const contents = fs.readFile(configPath);
    const config = JSON.parse(contents);
    if (!config || !Array.isArray(config.ignore_paths_containing)) {
      return defaultWorkspaceConfig();
    }
    return config;
  } catch {
    return defaultWorkspaceConfig();
  }
};

export const shouldIgnorePath = (path: string, ignorePathsContaining: string[]) =>
  ignorePathsContaining.some(part => path.includes(part));
