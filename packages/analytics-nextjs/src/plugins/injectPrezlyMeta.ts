import type { Context, Plugin } from '@segment/analytics-next';
import type { RefObject } from 'react';

import type { PrezlyMeta } from '../types';
import { version } from '../version';

/**
 * This plugin is inteded to be used on vanilla JS applications.
 * It depends on passed props to the AnalyticsProvider:
 *  - newsroom
 *  - story
 *  - gallery
 *  - trackingPolicy
 */
export function injectPrezlyMetaPlugin(metaRef: RefObject<PrezlyMeta['prezly'] | null>): Plugin {
    function apply(ctx: Context) {
        if (metaRef.current) {
            ctx.updateEvent('prezly', metaRef.current);
        }

        return ctx;
    }

    return {
        name: 'Inject Prezly Meta from AnalyticsProvider props',
        type: 'enrichment',
        version,

        isLoaded: () => true,
        load: () => Promise.resolve(),

        alias: apply,
        identify: apply,
        page: apply,
        track: apply,
    };
}
