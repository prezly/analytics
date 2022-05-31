import { AnalyticsBrowser, Context } from '@segment/analytics-next';

import { testSpyPlugin } from './testSpy';

it('loads correctly and reports its status', async () => {
    const plugin = testSpyPlugin(() => {});
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

it('logs events correctly', async () => {
    let eventCtx: Context;

    const plugin = testSpyPlugin((ctx) => (eventCtx = ctx));
    const trackSpy = jest.spyOn(plugin, 'track');

    const [analytics] = await AnalyticsBrowser.load(
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

    await analytics.track('Test Event');

    expect(trackSpy).toHaveBeenCalled();
    expect(eventCtx).not.toBe(undefined);
    expect(eventCtx.event.event).toBe('Test Event');
});
