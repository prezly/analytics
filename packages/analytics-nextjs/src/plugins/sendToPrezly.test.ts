import { AnalyticsBrowser, Context } from '@segment/analytics-next';

import * as getApiUrlModule from '../lib/getApiUrl';

import { sendEventToPrezlyPlugin } from './sendToPrezly';
import { testSpyPlugin } from './testSpy';

it('loads correctly and reports its status', async () => {
    const plugin = sendEventToPrezlyPlugin('abcd');
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

it('sends the event to Prezly Analytics', async () => {
    let eventCtx: Context;

    // Mock the `sendBeacon` method (it's not even present in the JSDOM environment)
    global.navigator.sendBeacon = jest.fn();
    const sendBeaconSpy = jest.spyOn(global.navigator, 'sendBeacon');

    const plugin = sendEventToPrezlyPlugin('abcd');
    const trackSpy = jest.spyOn(plugin, 'track');

    const getApiUrlSpy = jest.spyOn(getApiUrlModule, 'getApiUrl');
    getApiUrlSpy.mockImplementation(() => 'https://a.prezly.test');

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

    const expectedPayload = {
        ...eventCtx.event,
        writeKey: 'abcd',
    };

    expect(trackSpy).toHaveBeenCalled();
    expect(sendBeaconSpy).toHaveBeenCalledWith(
        'https://a.prezly.test/track/t',
        JSON.stringify(expectedPayload, null, 2),
    );
});
