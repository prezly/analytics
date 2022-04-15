export function getApiUrl(): string {
    if (process.env.NODE_ENV !== 'production') {
        return 'http://analytics.prezly.test';
    }

    return 'https://analytics.prezly.com';
}
