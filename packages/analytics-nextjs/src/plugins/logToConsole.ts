/* eslint-disable no-console */
import type { Context, Plugin } from '@segment/analytics-next';

import { stringify } from '../lib';
import { version } from '../version';

export function logToConsole(): Plugin {
    async function apply(ctx: Context) {
        const { type, userId, previousId, traits, category, name, properties, event } = ctx.event;

        if (type === 'identify') {
            console.log(`analytics.identify(${stringify(userId, traits)})`);
        }

        if (type === 'alias') {
            console.log(`analytics.alias(${stringify(userId, previousId)})`);
        }

        if (type === 'page') {
            console.log(`analytics.page(${stringify(category, name, properties)})`);
        }

        if (type === 'track') {
            console.log(`analytics.track(${stringify(event, properties)})`);
        }

        return ctx;
    }

    return {
        name: 'Log events to console',
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
