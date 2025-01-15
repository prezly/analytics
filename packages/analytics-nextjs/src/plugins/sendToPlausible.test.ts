import { AnalyticsBrowser } from '@segment/analytics-next';

import { sendEventToPlausiblePlugin } from './sendToPlausible';

it('sendEventToPlausiblePlugin plugin loads correctly and reports its status', async () => {
    const plugin = sendEventToPlausiblePlugin();
    const loadSpy = jest.spyOn(plugin, 'load');

    await AnalyticsBrowser.load({
        writeKey: '',
        cdnSettings: { integrations: {} },
        plugins: [plugin],
    });

    expect(loadSpy).toHaveBeenCalled();
    await loadSpy.mock.results[0].value;
    expect(plugin.isLoaded()).toBe(true);
});
