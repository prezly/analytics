import { getApiUrl } from './getApiUrl';

describe('getApiUrl', () => {
    const { env } = process;

    // This is needed to properly mock process.env, without affecting other tests.
    // See https://www.webtips.dev/how-to-mock-processenv-in-jest
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...env };
    });

    afterEach(() => {
        process.env = env;
    });

    it('returns test URL when not in production', () => {
        expect(getApiUrl()).toBe('http://analytics.prezly.test');
    });

    it('returns production URL when in production', () => {
        // @ts-ignore
        process.env.NODE_ENV = 'production';

        expect(getApiUrl()).toBe('https://analytics.prezly.com');
    });
});
