import { AnalyticsBrowser, Context, Plugin } from '@segment/analytics-next';

import * as getApiUrlModule from '../lib/getApiUrl';
import { version } from '../version';
import { Analytics } from '../Analytics';

import { sendEventToPrezlyPlugin } from './sendToPrezly';
import { TrackingPolicy } from '../types';

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

it('loads correctly and reports its status', async () => {
    const plugin = sendEventToPrezlyPlugin();
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

    const plugin = sendEventToPrezlyPlugin();
    const trackSpy = jest.spyOn(plugin, 'track');

    const getApiUrlSpy = jest.spyOn(getApiUrlModule, 'getApiUrl');
    getApiUrlSpy.mockImplementation(() => 'https://a.prezly.test');

    const analytics = new Analytics();

    analytics.init({
        segment: {
            settings: {
                writeKey: '',
                plugins: [plugin, testSpyPlugin((ctx) => (eventCtx = ctx))],
            },
            options: {
                integrations: { 'Segment.io': false },
            },
        },
        trackingPolicy: TrackingPolicy.NORMAL,
    });

    analytics.init(
        {
            cdnSettings: {
                integrations: {},
            },
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
        new Blob([JSON.stringify(expectedPayload, null, 2)], {
            type: 'application/json',
        }),
    );
});

it("doesn't send the event to Prezly Analytics when Prezly integration is disabled", async () => {
    let eventCtx: Context;

    // Mock the `sendBeacon` method (it's not even present in the JSDOM environment)
    global.navigator.sendBeacon = jest.fn();
    const sendBeaconSpy = jest.spyOn(global.navigator, 'sendBeacon');

    const plugin = sendEventToPrezlyPlugin();
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
            integrations: { 'Segment.io': false, Prezly: false },
        },
    );

    await analytics.track('Test Event');

    expect(trackSpy).toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();
});
