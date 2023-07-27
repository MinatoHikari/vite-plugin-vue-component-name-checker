# vite-plugin-vue-component-name-checker

A vite plugin to check if name of a component incorrect.
Currently only support checking name in `script` attrs or `defineOptions`

For example

```html
<script setup name="aaa"></script>

<script setup>
    defineOptions({
        name: 'aaa',
    });
</script>
```

When using `vite-plugin-pages`, we must name vue components correctly to work with `keep-alive`, the default regular of this plugin is check if vue files correctly be named using 
`vite-plugin-pages`'s filesystem routes.

### Install

```typescript
pnpm add -D vite-plugin-vue-component-name-checker

npm i -D vite-plugin-vue-component-name-checker

yarn add -D vite-plugin-vue-component-name-checker
```

### Usage

```typescript
import VueComponentNameChecker from './vite-plugins/vite-plugin-vue-component-name-checker';

export default defineConfig({
    plugins: [
        VueComponentNameChecker({
            dir: path.join(__dirname, 'src', 'pages'),
            exclude: ['/modules'],
        }),
    ],
});
```

### Options

```typescript
// root directory
dir: string
// vue file path which includes strings in exlude will be ignored
exclude?: string[]
// format component name if you want to use a special way to check component name
// id is the path of current module, you should return what you want which will be compared with name in defineOptions or name='xxx' in script setup attr.
regular?: (id: string) => string;

```
