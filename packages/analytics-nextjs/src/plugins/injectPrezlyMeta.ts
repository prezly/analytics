import type { Context, Plugin } from '@segment/analytics-next';

import { version } from '../version';

const META_PREFIX = 'prezly:';

/**
 * This plugin is inteded to be used on vanilla JS applications.
 * It depends on presence of specific <meta> tags with `prezly:` name prefix in the <head> of the document.
 * Example in JSX:
 *  <meta name="prezly:newsroom" content={newsroom.uuid} />
    {story && <meta name="prezly:story" content={story.uuid} />}
    {trackingPolicy !== TrackingPolicy.DEFAULT && (
        <meta name="prezly:tracking_policy" content={trackingPolicy} />
    )}
 */
export function injectPrezlyMetaPlugin(): Plugin {
    function apply(ctx: Context) {
        // Get "prezly:" meta tags contents, map them by name
        const metasContent = Array.from(document.getElementsByTagName('meta'))
            .filter((meta) => meta.name.startsWith(META_PREFIX))
            .reduce<Record<string, string>>(
                (props, meta) => ({
                    ...props,
                    [meta.name.replace(META_PREFIX, '').replace(/[-:]/g, '_')]: meta.content,
                }),
                {},
            );

        // {
        //   prezly: { newsroom: 'xxxx-xxxx-xxxxxxxx', story?: 'xxxx-xxxx-xxxxxxxx' }
        // }
        ctx.updateEvent('prezly', metasContent);

        return ctx;
    }

    return {
        name: 'Inject Prezly Meta',
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
