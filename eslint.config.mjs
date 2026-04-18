import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    {
        ignores: ['node_modules/**', 'dist/**'],
    },
    tseslint.configs.strictTypeChecked,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                    impliedStrict: true,
                },
            },
            globals: {
                global: true,
                process: true,
                __dirname: true,
                module: true,
                require: true,
            },
        },
    },
    {
        rules: {
            // Updated Rule Configuration
            '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
        },
    },
    {
        files: ['*.spec.ts*', '*.test.ts*'],
        rules: {
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
);
