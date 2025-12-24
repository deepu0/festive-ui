import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const plugins = [
    typescript({ tsconfig: './tsconfig.json' }),
    terser({
        compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
        },
        mangle: {
            properties: {
                regex: /^_/,
            },
        },
    }),
];

export default [
    // Core vanilla JS bundle
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: 'dist/index.esm.js',
                format: 'es',
                sourcemap: true,
            },
        ],
        plugins,
    },
    // React adapter bundle
    {
        input: 'src/react.tsx',
        output: [
            {
                file: 'dist/react.js',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: 'dist/react.esm.js',
                format: 'es',
                sourcemap: true,
            },
        ],
        external: ['react'],
        plugins,
    },
];
