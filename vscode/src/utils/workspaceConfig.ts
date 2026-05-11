export interface WorkspaceConfig {
  ignore_paths_containing: string[];
}

export const defaultWorkspaceConfig = (): WorkspaceConfig => ({
  ignore_paths_containing: [],
});

export const loadWorkspaceConfig = (
  readJsonFile: <T>(path: string) => T | undefined,
  configPath: string
): WorkspaceConfig => {
  try {
    const config = readJsonFile<WorkspaceConfig>(configPath);
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
