import type { Context, Plugin, SegmentEvent } from '@segment/analytics-next';

import { getApiUrl } from '../lib';
import { version } from '../version';

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

            // TODO: We encounter a CORS error when trying to send json to analytics.prezly.com
            // As a workaround, plain text is used until this is figured out.
            // const blob = new Blob([JSON.stringify(payload, null, 2)], {
            //     type: 'application/json',
            // });

            // navigator.sendBeacon(`${getApiUrl()}${endpoint}`, blob);

            navigator.sendBeacon(`${getApiUrl()}${endpoint}`, JSON.stringify(payload, null, 2));
        }

        return ctx;
    }

    return {
        name: 'Send events to Prezly Analytics',
        type: 'after',
        version,

        isLoaded: () => true,
        load: () => Promise.resolve(),

        alias: apply,
        group: apply,
        identify: apply,
        page: apply,
        track: apply,
    };
}
