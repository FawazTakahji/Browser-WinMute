const WINDOW_STORAGE_PREFIX = 'win_state_';

export async function getWindowValue(id: number, key: string): Promise<unknown> {
    if (import.meta.env.FIREFOX) {
        return await browser.sessions.getWindowValue(id, key);
    }

    const storageKey = `${WINDOW_STORAGE_PREFIX}${id}`;
    const data = await browser.storage.session.get(storageKey);
    const windowData = data[storageKey] || {};

    return windowData[key];
}

export async function setWindowValue(id: number, key: string, value: unknown): Promise<void> {
    if (import.meta.env.FIREFOX) {
        await browser.sessions.setWindowValue(id, key, value);
    } else {
        const storageKey = `${WINDOW_STORAGE_PREFIX}${id}`;
        const data = await browser.storage.session.get(storageKey);
        const windowData = data[storageKey] || {};
        windowData[key] = value;
        await browser.storage.session.set({
            [storageKey]: windowData
        });
    }
}