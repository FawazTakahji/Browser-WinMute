import volumeOffIcon from '@/assets/volume_off.svg';
import volumeUpIcon from '@/assets/volume_up.svg';
import { getWindowValue, setWindowValue } from "./windows";
import { checkExtensionVersion } from "./version-checker";
import type { Tabs, Windows } from 'webextension-polyfill';
import { Browser } from "@wxt-dev/browser";
import OnActivatedInfo = Browser.tabs.OnActivatedInfo;

type Tab = Tabs.Tab;
type Window = Windows.Window;
type OnUpdatedInfo = Tabs.OnUpdatedChangeInfoType;

const WINDOW_MUTED_KEY = 'isWindowMuted';
const VOLUME_OFF_ICONS = {
    16: "/assets/volume_off_16.png",
    24: "/assets/volume_off_24.png",
    32: "/assets/volume_off_32.png"
};
const VOLUME_UP_ICONS = {
    16: "/assets/volume_up_16.png",
    24: "/assets/volume_up_24.png",
    32: "/assets/volume_up_32.png"
};

export default defineBackground(() => {
    checkExtensionVersion();

    browser.runtime.onInstalled.addListener(async details => {
        if ((details.reason === "install" || details.reason === "update") && !import.meta.env.DEV) {
            const pageUrl = browser.runtime.getURL(`installed.html?reason=${details.reason}`);
            await browser.tabs.create({
                url: pageUrl
            });
        }
    })

    browser.commands.onCommand.addListener(handleCommand)
    browser.action.onClicked.addListener(handleActionClick);
    browser.tabs.onUpdated.addListener(handleTabUpdate);
    browser.tabs.onCreated.addListener(handleTabCreate);

    if (import.meta.env.FIREFOX) {
        browser.windows.onCreated.addListener(handleWindowCreate);
    } else if (import.meta.env.CHROME) {
        browser.tabs.onActivated.addListener(handleTabActivatedChrome);
        browser.tabs.onUpdated.addListener(handleTabUpdateChrome);

        // This is to help hide the flashing when a new tab is created.
        browser.action.setIcon({
            path: VOLUME_UP_ICONS
        }).catch(err => console.log("An error occurred while setting default action icon:", err));
    }

    (async () => {
        try {
            const windows = await browser.windows.getAll();
            for (const window of windows) {
                if (window.id !== undefined) {
                    const isMuted = await isWindowMuted(window.id);
                    if (import.meta.env.FIREFOX) {
                        setWindowActionTitleAndIcon(window.id, isMuted);
                    } else if (import.meta.env.CHROME) {
                        const [activeTab] = await browser.tabs.query({ windowId: window.id, active: true });
                        if (activeTab?.id !== undefined) {
                            setTabActionTitleAndIcon(activeTab.id, isMuted);
                        }
                    }
                    await applyWindowMuteState(window.id, isMuted);
                }
            }
        } catch (error) {
            console.error('An error occurred while restoring windows mute state:', error);
        }
    })();
});

async function handleCommand(command: string): Promise<void> {
    if (command === "toggle-window-mute") {
        const window = await browser.windows.getCurrent();
        if (window.id === undefined) {
            console.warn("Couldn't retrieve window id");
            return;
        }

        const isMuted = await isWindowMuted(window.id);
        const nextIsMuted = !isMuted;

        await setWindowMuteState(window.id, nextIsMuted);
        await applyWindowMuteState(window.id, nextIsMuted);

        if (import.meta.env.FIREFOX) {
            setWindowActionTitleAndIcon(window.id, nextIsMuted);
        } else if (import.meta.env.CHROME) {
            const [activeTab] = await browser.tabs.query({
                windowId: window.id,
                active: true
            });
            if (activeTab?.id !== undefined) {
                setTabActionTitleAndIcon(activeTab.id, nextIsMuted);
            }
        }
    }
}

async function handleActionClick(tab: Tab): Promise<void> {
    if (tab.windowId === undefined) {
        return;
    }
    const isMuted = await isWindowMuted(tab.windowId);
    const nextIsMuted = !isMuted;

    await setWindowMuteState(tab.windowId, nextIsMuted);
    await applyWindowMuteState(tab.windowId, nextIsMuted);

    if (import.meta.env.FIREFOX) {
        setWindowActionTitleAndIcon(tab.windowId, nextIsMuted);
    } else if (import.meta.env.CHROME && tab.id !== undefined) {
        setTabActionTitleAndIcon(tab.id, nextIsMuted);
    }
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

async function handleTabActivatedChrome(activeInfo: OnActivatedInfo): Promise<void> {
    const isMuted = await isWindowMuted(activeInfo.windowId);
    setTabActionTitleAndIcon(activeInfo.tabId, isMuted);
}

async function handleTabUpdateChrome(id: number, changeInfo: OnUpdatedInfo, tab: Tab): Promise<void> {
    if (changeInfo.status !== "loading" || tab.windowId === undefined || tab.id === undefined) {
        return;
    }

    const isMuted = await isWindowMuted(tab.windowId);
    setTabActionTitleAndIcon(tab.id, isMuted);
}

function setWindowActionTitleAndIcon(windowId: number, isMuted: boolean): void {
    browser.action.setTitle({
        title: isMuted ? 'Unmute Window' : 'Mute Window',
        windowId: windowId
    }).catch(e => console.error('Failed to set action title:', e));

    browser.action.setIcon({
        path: isMuted ? volumeOffIcon : volumeUpIcon,
        windowId: windowId
    }).catch(e => console.error('Failed to set action icon:', e));
}

function setTabActionTitleAndIcon(tabId: number, isMuted: boolean): void {
    browser.action.setTitle({
        title: isMuted ? "Unmute Window" : "Mute Window",
        tabId: tabId
    }).catch(e => console.error("Failed to set action title:", e));

    browser.action.setIcon({
        path: isMuted ? VOLUME_OFF_ICONS : VOLUME_UP_ICONS,
        tabId: tabId
    }).catch(e => console.error("Failed to set action icon:", e));
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

            if (import.meta.env.CHROME) {
                setTabActionTitleAndIcon(tab.id, isMuted);
            }
        }
    }
}

async function setTabMuteState(id: number, isMuted: boolean): Promise<void> {
    await browser.tabs.update(id, {
        muted: isMuted
    });
}