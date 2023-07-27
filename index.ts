import { readFileSync } from 'node:fs';
import { sep } from 'node:path';
import { parse } from '@vue/compiler-sfc';
import { createLogger } from 'vite';
import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';

export type Options = {
    dir: string;
    exclude?: string[];
    regular?: (id: string) => string;
};

export default function VueComponentNameChecker(options: Options) {
    const { dir, exclude, regular } = options;
    return {
        name: 'vite-plugin-vue-component-name-checker',
        resolveId(id: string) {
            return null;
        },
        async transform(code: string, id: string) {
            let defineOptionsName: string | null = null;
            let line: number | null = null;
            const prefix = dir.split(sep).join('/');
            const originId = id;
            id = id.split(sep).join('/');

            if (
                id.endsWith('.vue') &&
                id.startsWith(prefix) &&
                exclude?.every((path) => {
                    return !id.includes(path);
                })
            ) {
                const camelcase = (await import('camelcase')).default;
                let nameStr = id.split(prefix)[1];

                if (regular) {
                    nameStr = regular(id);
                } else {
                    if (id.endsWith('index.vue')) nameStr = nameStr.split('/index.vue')[0];
                    else nameStr = nameStr.split('.vue')[0];
                }

                const idComponentName = camelcase(nameStr.replaceAll('/', '-'), {
                    pascalCase: true,
                    preserveConsecutiveUppercase: true,
                });
                const buffer = readFileSync(originId);
                const parseResult = parse(String(buffer));
                // console.log(parseResult.descriptor.scriptSetup);
                const scriptStartLine = parseResult.descriptor.scriptSetup?.loc.start.line ?? 0;
                const content = parseResult.descriptor.scriptSetup?.content;
                if (content) {
                    const ast = babelParse(content, {
                        sourceType: 'module',
                        plugins: ['jsx'],
                    });

                    traverse(ast, {
                        CallExpression(path) {
                            const node = path.node;
                            if (
                                node.callee.type === 'Identifier' &&
                                node.callee.name === 'defineOptions'
                            )
                                node.arguments.forEach((i) => {
                                    if (i.type === 'ObjectExpression') {
                                        i.properties.forEach((j) => {
                                            if (
                                                j.type === 'ObjectProperty' &&
                                                j.key.type === 'Identifier' &&
                                                j.key.name === 'name'
                                            ) {
                                                if (j.value.type === 'StringLiteral') {
                                                    // console.log(j);
                                                    defineOptionsName = j.value.value;
                                                    line = i.loc?.start.line
                                                        ? i.loc.start.line + scriptStartLine
                                                        : null;
                                                }
                                            }
                                        });
                                    }
                                });
                        },
                    });
                }
                const attrs = parseResult.descriptor.scriptSetup?.attrs;

                const logger = createLogger();
                if (defineOptionsName && attrs?.name) {
                    logger.warn('[Conflict component name types]');
                    logger.info(`[script-name]: ${id}:${scriptStartLine}`);
                    logger.info(`[defineOptions]: ${id}:${line}`);
                }

                if (
                    defineOptionsName !== idComponentName &&
                    !(attrs && attrs.name && attrs.name === idComponentName)
                ) {
                    if (!defineOptionsName) line = scriptStartLine;
                    logger.error(
                        `[Incorrect/Undefined Component Name]: ${id}${line ? `:${line}` : ''}`,
                    );
                    logger.info(`[Name]: ${defineOptionsName ?? attrs?.name}`);
                    logger.info(`[Correct Name]: ${idComponentName}`);
                }
            }
        },
    };
}
