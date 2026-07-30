import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifestVersion: 3,
    manifest: (env) => {
        const permissions: string[] = [];
        if (env.browser === "firefox") {
            permissions.push("sessions");
        } else if (env.browser === "chrome") {
            permissions.push("storage");
        }

        return {
            name: "Window Mute",
            description: "Placeholder description",
            permissions: permissions,
            action: {
                default_area: "navbar",
                default_title: "Window Mute"
            },
            browser_specific_settings: {
                gecko: {
                    id: "window-mute@fawaztakahji.github.io",
                    data_collection_permissions: {
                        required: ["none"]
                    }
                }
            }
        };
    },
    modules: [
        "@wxt-dev/auto-icons",
        "@wxt-dev/webextension-polyfill"
    ],
    autoIcons: {
        baseIconPath: "./assets/icon.svg",
        developmentIndicator: false,
        sizes: [16, 32, 48, 96, 128]
    }
});