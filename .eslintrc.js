module.exports = {
    root: true,
    extends: ['@prezly', '@prezly/eslint-config/react'],
    parserOptions: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
    },
    rules: {},
    ignorePatterns: ['**/*.test.*'],
};
