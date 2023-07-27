import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            formats: ['umd'],
            entry: path.resolve(__dirname, './index.ts'),
            name: 'vite-plugin-vue-component-name-checker',
            fileName: 'index',
        },
        rollupOptions: {
            external: [
                'node',
                'camelcase',
                'vite',
                '@babel/traverse',
                '@babel/parser',
                '@vue/compiler-sfc',
            ],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    node: 'Node',
                    camelcase: 'Camelcase',
                    vite: 'Vitette',
                    '@babel/traverse': 'BabelTraverse',
                    '@babel/parser': 'BabelParser',
                    '@vue/compiler-sfc': 'VueComplierSFC',
                },
            },
        },
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
        nodePolyfills({
            // Whether to polyfill `node:` protocol imports.
            // protocolImports: true,
        }),
    ],
});
