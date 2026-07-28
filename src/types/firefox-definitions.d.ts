import 'wxt/browser';
import TitleDetails = Browser.action.TitleDetails;

export type FirefoxTitleDetails = TitleDetails & {
  windowId?: number | undefined;
}

declare module 'wxt/browser' {
  export namespace Browser {
    export namespace sessions {
      function getWindowValue(windowId: number, key: string): Promise<unknown>;
      function setWindowValue(windowId: number, key: string, value: unknown): Promise<void>;
    }
  }
}