import type { Context, Plugin, SegmentEvent } from '@segment/analytics-next';

import { getApiUrl } from '../lib';

const ENDPOINTS_BY_TYPE: Record<SegmentEvent['type'], string | null> = {
    alias: '/track/a',
    group: '/track/g',
    identify: '/track/i',
    page: '/track/p',
    track: '/track/t',
    screen: null,
};

export function sendEventToPrezlyPlugin(newsroomUuid: string): Plugin {
    async function apply(ctx: Context) {
        const endpoint = ENDPOINTS_BY_TYPE[ctx.event.type];

        if (endpoint) {
            const payload = {
                ...ctx.event,
                // TODO: Prezly Analytics app should be able to take the newsroom UUID from the `prezly` property
                writeKey: newsroomUuid,
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: 'application/json',
            });

            navigator.sendBeacon(`${getApiUrl()}${endpoint}`, blob);
        }

        return ctx;
    }

    return {
        name: 'Send events to Prezly Analytics',
        type: 'after',
        // TODO: Sync with package version
        version: '0.1.0',

        isLoaded: () => true,
        load: () => Promise.resolve(),

        alias: apply,
        group: apply,
        identify: apply,
        page: apply,
        track: apply,
    };
}
