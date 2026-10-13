import { defineConfig } from '@rsbuild/core';

export default defineConfig({
    source: {
        entry: {
            index: './ui/src/main.ts',
        },
    },
    html: {
        template: './ui/index.html',
    },
    output: {
        // scripts/bundle-ui.sh builds into a directory of its own and moves the files into dist, so nothing reads dist half written.
        distPath: {
            root: process.env.BUNDLE_UI_OUT_DIR ?? 'dist',
        },
        // The built UI is loaded from an address of the app's own in every web view, so its files are found relative to the page.
        assetPrefix: './',
        filenameHash: false,
        minify: false,
    },
});
