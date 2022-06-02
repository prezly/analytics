import { AnalyticsBrowser, Context } from '@segment/analytics-next';

import { normalizePrezlyMetaPlugin } from './normalizePrezlyMeta';
import { testSpyPlugin } from './testSpy';

it('loads correctly and reports its status', async () => {
    const plugin = normalizePrezlyMetaPlugin();
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

it('should not alter the event when prezly meta is not present', async () => {
    let eventCtx: Context;

    const plugin = normalizePrezlyMetaPlugin();
    const trackSpy = jest.spyOn(plugin, 'track');
    const identifySpy = jest.spyOn(plugin, 'identify');

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

    // Test for `track` event
    await analytics.track('Test Event');

    expect(trackSpy).toHaveBeenCalled();
    // `prezly` property on the event root is custom and is not present in the default event type
    // @ts-expect-error
    expect(eventCtx.event.prezly).toBe(undefined);

    // Test for `identify` event
    await analytics.identify('Test ID');

    expect(identifySpy).toHaveBeenCalled();
    // `prezly` property on the event root is custom and is not present in the default event type
    // @ts-expect-error
    expect(eventCtx.event.prezly).toBe(undefined);
});

it('should move the `prezly` property from traits to event root', async () => {
    let eventCtx: Context;

    const plugin = normalizePrezlyMetaPlugin();
    const trackSpy = jest.spyOn(plugin, 'track');
    const identifySpy = jest.spyOn(plugin, 'identify');

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

    // Test for `track` events
    await analytics.track('Test Event', { prezly: { newsroom: 'abcd' } });

    expect(trackSpy).toHaveBeenCalled();

    expect(eventCtx.event.properties!.prezly).toBe(undefined);
    // `prezly` property on the event root is custom and is not present in the default event type
    // @ts-expect-error
    expect(eventCtx.event.prezly).toEqual({ newsroom: 'abcd' });

    // Test for `identify` events
    await analytics.identify('Test ID', { prezly: { newsroom: 'abcd' } });

    expect(identifySpy).toHaveBeenCalled();

    expect(eventCtx.event.traits!.prezly).toBe(undefined);
    // `prezly` property on the event root is custom and is not present in the default event type
    // @ts-expect-error
    expect(eventCtx.event.prezly).toEqual({ newsroom: 'abcd' });
});
