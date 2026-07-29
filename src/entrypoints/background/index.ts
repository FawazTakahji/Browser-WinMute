import volumeOffIcon from '@/assets/volume_off.svg';
import volumeUpIcon from '@/assets/volume_up.svg';
import { Browser } from "@wxt-dev/browser";
import Tab = Browser.tabs.Tab;
import Window = Browser.windows.Window;
import { getWindowValue, setWindowValue } from "./windows";
import { FirefoxTabIconDetails, FirefoxTitleDetails } from "@/types/firefox-definitions";
import OnUpdatedInfo = Browser.tabs.OnUpdatedInfo;

const WINDOW_MUTED_KEY = 'isWindowMuted';

export default defineBackground(() => {
  browser.action.onClicked.addListener(handleActionClick);
  browser.tabs.onUpdated.addListener(handleTabUpdate);
  browser.tabs.onCreated.addListener(handleTabCreate);
  browser.windows.onCreated.addListener(handleWindowCreate);

  (async () => {
    try {
      const windows = await browser.windows.getAll();
      for (const window of windows) {
        if (window.id !== undefined) {
          const isMuted = await isWindowMuted(window.id);
          setWindowActionTitleAndIcon(window.id, isMuted);
          await applyWindowMuteState(window.id, isMuted);
        }
      }
    } catch (error) {
      console.error('An error occurred while restoring windows mute state:', error);
    }
  })();
});

async function handleActionClick(tab: Tab): Promise<void> {
  const isMuted = await isWindowMuted(tab.windowId);
  const nextIsMuted = !isMuted;

  await setWindowMuteState(tab.windowId, nextIsMuted);
  await applyWindowMuteState(tab.windowId, nextIsMuted);

  setWindowActionTitleAndIcon(tab.windowId, nextIsMuted);
}

async function handleTabUpdate(id: number, changeInfo: OnUpdatedInfo, tab: Tab): Promise<void> {
  if (tab.windowId === undefined || tab.id === undefined) {
    return;
  }

  const isUndiscarded = changeInfo.discarded === false;
  const isNavigating = changeInfo.status === 'loading' && !tab.discarded;

  if (isUndiscarded || isNavigating) {
    const isMuted = await isWindowMuted(tab.windowId);
    await setTabMuteState(tab.id, isMuted);
  }
}

async function handleTabCreate(tab: Tab): Promise<void> {
  if (tab.windowId === undefined || tab.id === undefined) {
    return;
  }

  const isMuted = await isWindowMuted(tab.windowId);
  await setTabMuteState(tab.id, isMuted);
}

async function handleWindowCreate(window: Window): Promise<void> {
  if (window.id === undefined) {
    return;
  }

  const isMuted = await isWindowMuted(window.id);
  setWindowActionTitleAndIcon(window.id, isMuted);
}

function setWindowActionTitleAndIcon(windowId: number, isMuted: boolean): void {
  browser.action.setTitle({
    title: isMuted ? 'Unmute Window' : 'Mute Window',
    windowId: windowId
  } as FirefoxTitleDetails).catch(e => console.error('Failed to set action title:', e));

  browser.action.setIcon({
    path: isMuted ? volumeOffIcon : volumeUpIcon,
    windowId: windowId
  } as FirefoxTabIconDetails).catch(e => console.error('Failed to set action icon:', e));
}

async function isWindowMuted(id: number): Promise<boolean> {
  try {
    const val = await getWindowValue(id, WINDOW_MUTED_KEY);
    return val === "true" || val === true;
  } catch (error) {
    console.error(`Failed to get window session value for window ${id}:`, error);
    return false;
  }
}

async function setWindowMuteState(id: number, isMuted: boolean): Promise<void> {
  try {
    await setWindowValue(id, WINDOW_MUTED_KEY, isMuted);
  } catch (error) {
    console.error(`Failed to set window session value for window ${id}:`, error);
  }
}

async function applyWindowMuteState(id: number, isMuted: boolean): Promise<void> {
  const tabs = await browser.tabs.query({
    windowId: id,
    discarded: false
  });

  for (const tab of tabs) {
    if (tab.id !== undefined) {
      await setTabMuteState(tab.id, isMuted);
    }
  }
}

async function setTabMuteState(id: number, isMuted: boolean): Promise<void> {
  await browser.tabs.update(id, {
    muted: isMuted
  });
}