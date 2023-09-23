export interface VsCodeExtensionContext {
  subscriptions: { dispose(): any }[];
}
