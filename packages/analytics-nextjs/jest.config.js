/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    collectCoverage: true,
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json',
        },
    },
    restoreMocks: true,
};
