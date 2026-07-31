import { defineConfig } from 'wxt';
import sharp from 'sharp';
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";

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
    hooks: {
        'build:publicAssets': async (wxt, files) => {
            if (wxt.config.browser !== "chrome") {
                return;
            }

            const icons = ["volume_off", "volume_up"];
            const sizes = [16, 24, 32];

            const assetDir = resolve(wxt.config.srcDir, "assets");
            const outputDir = resolve(wxt.config.outDir, "assets");

            await mkdir(outputDir, { recursive: true });

            for (const icon of icons) {
                for (const size of sizes) {
                    const fileName = `${icon}_${size}.png`;
                    const src = resolve(assetDir, `${icon}.svg`);
                    const dest = resolve(outputDir, fileName);

                    await sharp(src).resize(size).png().toFile(dest);

                    files.push({
                        absoluteSrc: dest,
                        relativeDest: `assets/${fileName}`
                    });
                }
            }
        }
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