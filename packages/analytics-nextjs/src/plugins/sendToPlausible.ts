import type { Context, Plugin } from '@segment/analytics-next';
import type PlausibleType from 'plausible-tracker';
import type { PlausibleOptions } from 'plausible-tracker';

import { version } from '../version';

interface ExtendedContext extends Context {
    plausible?: ReturnType<typeof PlausibleType>;
}

export function sendEventToPlausiblePlugin(options?: PlausibleOptions): Plugin {
    let plausible: ReturnType<typeof PlausibleType> | null = null;

    async function track(ctx: ExtendedContext) {
        const shouldSendToPlausible =
            plausible && 'event' in ctx.event && ctx.event.integrations?.Plausible !== false;

        if (shouldSendToPlausible) {
            plausible!.trackEvent(ctx.event.event!, { props: ctx.event.properties });
        }

        return ctx;
    }

    return {
        name: 'Send events to Plausible',
        type: 'destination',
        version,

        isLoaded: () => Boolean(plausible),
        load: async () => {
            const Plausible = await import('plausible-tracker').then((result) => result.default);
            plausible = Plausible(options);
        },

        track,
    };
}
