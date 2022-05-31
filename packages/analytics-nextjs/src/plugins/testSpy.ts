import type { Context, Plugin } from '@segment/analytics-next';

import { version } from '../version';

export function testSpyPlugin(callback: (ctx: Context) => void): Plugin {
    async function apply(ctx: Context) {
        callback(ctx);
        return ctx;
    }

    return {
        name: 'Spy on sent events (for testing purposes)',
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
