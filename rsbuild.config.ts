import { watch } from 'node:fs';
import { defineConfig } from '@rsbuild/core';

//
// Whether Linux has a file watch to spare. Other programs can use up every watch the user is allowed, and Rsbuild then
// crashes with ENOSPC instead of watching the frontend.
//
function canWatchFiles(): boolean {
    try {
        watch('frontend').close();
        return true;
    }
    catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOSPC') {
            return false;
        }
        throw error;
    }
}

const useWatchPolling = !canWatchFiles();
if (useWatchPolling) {
    console.warn('No file watches left on this machine, so Rsbuild checks the frontend for changes by polling.');
    // Rsbuild watches its config file with chokidar, which polls when this is set.
    process.env.CHOKIDAR_USEPOLLING = '1';
}

export default defineConfig({
    tools: {
        rspack: {
            watchOptions: {
                poll: useWatchPolling,
            },
        },
    },
    source: {
        entry: {
            index: './frontend/src/main.ts',
        },
    },
    html: {
        template: './frontend/index.html',
    },
    output: {
        // scripts/bundle-ui.sh builds into a directory of its own and moves the files into dist, so nothing reads dist half written.
        distPath: {
            root: process.env.BUNDLE_UI_OUT_DIR ?? 'dist',
        },
        // The built frontend is loaded from an address of the app's own in every web view, so its files are found relative to the page.
        assetPrefix: './',
        filenameHash: false,
        minify: false,
    },
});
