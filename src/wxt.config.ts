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
    }
});
