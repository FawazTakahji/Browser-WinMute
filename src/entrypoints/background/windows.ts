export async function getWindowValue(id: number, key: string): Promise<unknown> {
    if (import.meta.env.FIREFOX) {
        return await browser.sessions.getWindowValue(id, key);
    }

    throw new Error('This method is not supported on this browser.');
}

export async function setWindowValue(id: number, key: string, value: unknown): Promise<void> {
    if (import.meta.env.FIREFOX) {
        await browser.sessions.setWindowValue(id, key, value);
    }
}