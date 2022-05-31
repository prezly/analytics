import { AnalyticsBrowser, Context } from '@segment/analytics-next';
import { injectPrezlyMetaPlugin } from './injectPrezlyMeta';
import { testSpyPlugin } from './testSpy';

it('loads correctly and reports its status', async () => {
    const plugin = injectPrezlyMetaPlugin();
    const loadSpy = jest.spyOn(plugin, 'load');

    await AnalyticsBrowser.load(
        {
            writeKey: '',
            cdnSettings: {
                integrations: {},
            },
            plugins: [plugin],
        },
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            integrations: { 'Segment.io': false },
        },
    );

    expect(loadSpy).toHaveBeenCalled();
    expect(plugin.isLoaded()).toBe(true);
});

it('works correctly with no meta tags present', async () => {
    let eventCtx: Context;

    const plugin = injectPrezlyMetaPlugin();
    const trackSpy = jest.spyOn(plugin, 'track');

    const [analytics] = await AnalyticsBrowser.load(
        {
            writeKey: '',
            cdnSettings: {
                integrations: {},
            },
            plugins: [plugin, testSpyPlugin((ctx) => (eventCtx = ctx))],
        },
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            integrations: { 'Segment.io': false },
        },
    );

    await analytics.track('Test Event');

    expect(trackSpy).toHaveBeenCalled();
    // @ts-expect-error
    expect(eventCtx.event.prezly).toEqual({});
});

it('works correctly with prezly: meta tags present', async () => {
    let eventCtx: Context;

    const plugin = injectPrezlyMetaPlugin();
    const trackSpy = jest.spyOn(plugin, 'track');

    const [analytics] = await AnalyticsBrowser.load(
        {
            writeKey: '',
            cdnSettings: {
                integrations: {},
            },
            plugins: [plugin, testSpyPlugin((ctx) => (eventCtx = ctx))],
        },
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            integrations: { 'Segment.io': false },
        },
    );

    const newsroomMeta = document.createElement('meta');
    const storyMeta = document.createElement('meta');

    newsroomMeta.setAttribute('name', 'prezly:newsroom');
    newsroomMeta.setAttribute('content', 'abcd');
    storyMeta.setAttribute('name', 'prezly:story');
    storyMeta.setAttribute('content', 'asdf');

    document.head.appendChild(newsroomMeta);
    document.head.appendChild(storyMeta);

    await analytics.track('Test Event');

    expect(trackSpy).toHaveBeenCalled();
    // @ts-expect-error
    expect(eventCtx.event.prezly).toEqual({ newsroom: 'abcd', story: 'asdf' });
});
