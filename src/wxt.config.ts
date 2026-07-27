import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: ({}) => {
        return {
            name: "Window Mute",
            description: "Placeholder description",
            action: {
                default_area: "navbar",
                default_title: "Window Mute"
            }
        };
    },
    modules: [
        "@wxt-dev/auto-icons"
    ],
    autoIcons: {
        baseIconPath: "./assets/icon.svg",
        developmentIndicator: false,
        sizes: [16, 32, 48, 96, 128]
    }
