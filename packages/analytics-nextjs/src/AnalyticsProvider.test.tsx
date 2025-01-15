import React from 'react';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { DEFAULT_NEWSROOM } from './__mocks__/newsroom';

import { AnalyticsProvider } from './AnalyticsProvider';
import { useEffect } from 'react';
import { useAnalytics } from './hooks';

function TestingComponent() {
    const analytics = useAnalytics();

    useEffect(() => {
        analytics.track('abc');
    }, []);

    return <div></div>;
}

describe('AnalyticsProvider', () => {
    it('renders into document', async () => {
        const analyticsSpy = jest.spyOn(AnalyticsBrowser, 'load');

        render(<AnalyticsProvider newsroom={DEFAULT_NEWSROOM} />);

        await waitFor(() => expect(analyticsSpy).toHaveBeenCalledTimes(1));
    });

    it('Works without Newsroom provided and shows a warning without segment write key', async () => {
        const consoleSpy = jest.spyOn(console, 'warn');

        render(<AnalyticsProvider></AnalyticsProvider>);

        await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith(
                'Warning: You have not provided neither `newsroom`, nor `segmentWriteKey`. The library will not send any events.',
            ),
        );
    });

    it('Logs an error to console and fails gracefully when analytics fail to load', async () => {
        const consoleSpy = jest.spyOn(console, 'error');
        const analyticsSpy = jest.spyOn(AnalyticsBrowser, 'load');

        const error = new Error('Test Error');

        analyticsSpy.mockImplementationOnce(() => {
            throw error;
        });

        render(<AnalyticsProvider>test</AnalyticsProvider>);

        await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith('Error while loading Analytics', error),
        );
    });

    it('injects Prezly metadata to an event', async () => {
        const track = jest.fn();

        render(
            <AnalyticsProvider
                newsroom={DEFAULT_NEWSROOM}
                story={{ uuid: 'story_uuid' }}
                gallery={{ uuid: 'gallery_uuid' }}
                plugins={[
                    {
                        name: '_',
                        type: 'after',
                        isLoaded: () => true,
                        load: () => Promise.resolve(),
                        track(ctx) {
                            track(ctx);
                            return ctx;
                        },
                    },
                ]}
            >
                <TestingComponent />
            </AnalyticsProvider>,
        );

        await waitFor(() => expect(track).toBeCalled());
        const context = track.mock.lastCall[0];
        expect(context).toHaveProperty('event');
        expect(context.event).toHaveProperty('prezly');
        expect(context.event.prezly).toEqual({
            newsroom: DEFAULT_NEWSROOM.uuid,
            story: 'story_uuid',
            gallery: 'gallery_uuid',
            tracking_policy: DEFAULT_NEWSROOM.tracking_policy,
        });
    });
});
