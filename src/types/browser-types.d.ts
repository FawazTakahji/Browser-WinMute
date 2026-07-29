import '@wxt-dev/browser';
import type { Sessions, Action, Tabs, Windows } from 'webextension-polyfill';

declare module '@wxt-dev/browser' {
  namespace Browser {
    export const sessions: Sessions.Static;
    export const action: Action.Static;
    export namespace tabs {
      export type Tab = Tabs.Tab;
      export type OnUpdatedChangeInfo = Tabs.OnUpdatedChangeInfoType;
    }
    export namespace windows {
      export type Window = Windows.Window;
    }
  }
}
