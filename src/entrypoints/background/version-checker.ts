export function compareVersions(v1: string, v2: string): number {
    const len = Math.max(v1.length, v2.length);
    for (let i = 0; i < len; i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;
        if (num1 > num2) {
            return 1;
        }
        if (num1 < num2) {
            return -1;
        }
    }
    return 0;
}

export async function checkExtensionVersion(): Promise<void> {
    try {
        const info = await browser.management.getSelf();
        if (info.installType === 'normal') {
            return;
        }

        const wxtVersion = browser.runtime.getManifest().version;
        const response = await fetch(`https://api.github.com/repos/${import.meta.env.WXT_GITHUB_OWNER}/${import.meta.env.WXT_GITHUB_REPO}/releases/latest`, {
            headers: {
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            console.warn(`[VersionChecker] Failed to fetch latest release. Status: ${response.status}`);
            return;
        }

        const data = await response.json();
        const latestTag = data.tag_name;
        if (!latestTag) {
            console.warn('[VersionChecker] No tag or release name found in GitHub response.');
            return;
        }

        const latestVersion = latestTag.replace(/^v/i, '').trim();
        const currentVersion = wxtVersion.replace(/^v/i, '').trim();

        if (compareVersions(latestVersion, currentVersion) > 0) {
            const storage = await browser.storage.local.get('lastNotifiedVersion');
            if (storage.lastNotifiedVersion === latestVersion) {
                return;
            }

            await browser.storage.local.set({ lastNotifiedVersion: latestVersion });
            const pageUrl = browser.runtime.getURL(
                `installed.html?reason=update_available&latest=${encodeURIComponent(latestVersion)}&current=${encodeURIComponent(currentVersion)}`
            );
            await browser.tabs.create({ url: pageUrl });
        }
    } catch (error) {
        console.error('[VersionChecker] Error checking version:', error);
    }
}
