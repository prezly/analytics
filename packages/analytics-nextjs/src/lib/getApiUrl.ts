/**
 * We don't want to flood the production Prezly Analytics API when testing locally, so it's only used on Production environment.
 * Alteratively, you can set `NEXT_PUBLIC_PREZLY_ANALYTICS_FORCE_PROD_API` to `true` in your .env to use the production analytics URL.
 */
export function getApiUrl(): string {
    if (
        process.env.NODE_ENV !== 'production' &&
        process.env.NEXT_PUBLIC_PREZLY_ANALYTICS_FORCE_PROD_API !== 'true'
    ) {
        return 'http://analytics.prezly.test';
    }

    return 'https://analytics.prezly.com';
}
