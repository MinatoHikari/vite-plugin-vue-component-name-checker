import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, './index.ts'),
            name: 'vite-plugin-vue-component-name-checker',
            fileName: 'index',
        },
        rollupOptions: {},
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
            },
        },
    },
    plugins: [
        dts({
            tsconfigPath: 'tsconfig.build.json',
            insertTypesEntry: true,
        }),
    ],
});
