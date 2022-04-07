import type { Context, Plugin } from '@segment/analytics-next';

export function injectPrezlyMetaPlugin(): Plugin {
    function apply(ctx: Context) {
        const metas: HTMLMetaElement[] = Array.prototype.slice
            .call(document.getElementsByTagName('meta'))
            .filter((meta) => meta.name.substr(0, 7) === 'prezly:');

        // Get "prezly:" meta tags contents, map them by name
        const metasContent = metas.reduce<Record<string, string>>(
            (props, meta) => ({
                ...props,
                [meta.name.substring(7).replace(/[-:]/g, '_')]: meta.content,
            }),
            {},
        );

        // {
        //   prezly: { newsroom: 'xxxx-xxxx-xxxxxxxx', story?: 'xxxx-xxxx-xxxxxxxx' }
        // }
        ctx.updateEvent('properties.prezly', metasContent);

        return ctx;
    }

    return {
        name: 'Inject Prezly Meta',
        type: 'enrichment',
        // TODO: Sync with package version
        version: '0.1.0',

        isLoaded: () => true,
        load: () => Promise.resolve(),

        alias: apply,
        identify: apply,
        page: apply,
        track: apply,
    };
}
