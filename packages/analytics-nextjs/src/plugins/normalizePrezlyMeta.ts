import type { Context, Plugin } from '@segment/analytics-next';

import { version } from '../version';

/**
 * This plugin is complementing the Prezly Meta injection logic in the `useAnalytics` hook.
 * It moves the `prezly` object from event properties to the event root.,
 */
export function normalizePrezlyMetaPlugin(): Plugin {
    function applyEvent(ctx: Context) {
        const { properties } = ctx.event;

        if (!properties || !properties.prezly) {
            return ctx;
        }

        const { prezly: prezlyMeta, ...normalizedProperties } = properties;

        ctx.updateEvent('prezly', prezlyMeta);
        ctx.updateEvent('properties', normalizedProperties);

        return ctx;
    }

    function applyIdentify(ctx: Context) {
        const { traits } = ctx.event;

        if (!traits || !traits.prezly) {
            return ctx;
        }

        const { prezly: prezlyMeta, ...normalizedTraits } = traits;

        ctx.updateEvent('prezly', prezlyMeta);
        ctx.updateEvent('traits', normalizedTraits);

        return ctx;
    }

    return {
        name: 'Normalize Prezly Meta',
        type: 'enrichment',
        version,

        isLoaded: () => true,
        load: () => Promise.resolve(),

        identify: applyIdentify,
        page: applyEvent,
        track: applyEvent,
    };
}
