import 'wxt/browser';

declare module 'wxt/browser' {
  export namespace Browser {
    export namespace sessions {
      function getWindowValue(windowId: number, key: string): Promise<string | undefined>;
      function setWindowValue(windowId: number, key: string, value: string): Promise<void>;
    }
  }
}