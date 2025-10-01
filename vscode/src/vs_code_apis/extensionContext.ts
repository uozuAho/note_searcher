export interface IVsCodeExtensionContext {
  subscriptions: { dispose(): any }[];
}
