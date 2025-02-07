import type { Context, Plugin, SegmentEvent } from '@segment/analytics-next';

import { getApiUrl } from '../lib/getApiUrl';
import type { PrezlyMeta } from '../types';
import { version } from '../version';

const ENDPOINTS_BY_TYPE: Record<SegmentEvent['type'], string | null> = {
    alias: '/track/a',
    group: '/track/g',
    identify: '/track/i',
    page: '/track/p',
    track: '/track/t',
    screen: null,
};

export function sendEventToPrezlyPlugin(): Plugin {
    async function apply(ctx: Context) {
        const endpoint = ENDPOINTS_BY_TYPE[ctx.event.type];
        const shouldSendToPrezly = ctx.event.integrations?.Prezly !== false;
        const newsroomUuid = 'prezly' in ctx.event && (ctx.event.prezly as PrezlyMeta).newsroom;

        if (shouldSendToPrezly && endpoint && newsroomUuid) {
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
        type: 'destination',
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
