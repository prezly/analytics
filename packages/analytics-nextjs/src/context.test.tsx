import React from 'react';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { DEFAULT_NEWSROOM } from './__mocks__/newsroom';

import { AnalyticsContextProvider, useAnalyticsContext } from './context';
import { getConsentCookie } from './lib';

jest.mock('./lib');

const getConsentCookieMock = getConsentCookie as jest.MockedFunction<typeof getConsentCookie>;

function TestingComponent() {
    const { isEnabled } = useAnalyticsContext();

    return <div>Analytics {isEnabled ? 'enabled' : 'disabled'}</div>;
}

describe('AnalyticsContextProvider', () => {
    it('renders into document', async () => {
        getConsentCookieMock.mockReturnValue(true);
        const analyticsSpy = jest.spyOn(AnalyticsBrowser, 'load');

        render(<AnalyticsContextProvider newsroom={DEFAULT_NEWSROOM} />);

        expect(getConsentCookieMock).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(analyticsSpy).toHaveBeenCalledTimes(1));
    });

    it('passes the `isEnabled` prop into the context', async () => {
        getConsentCookieMock.mockReturnValue(true);

        const { getByText } = render(
            <AnalyticsContextProvider newsroom={DEFAULT_NEWSROOM} isEnabled={false}>
                <TestingComponent />
            </AnalyticsContextProvider>,
        );

        expect(getByText(/analytics/i)).toHaveTextContent('disabled');
    });

    it('Works without Newsroom provided and shows a warning without segment write key', async () => {
        getConsentCookieMock.mockReturnValue(true);
        const consoleSpy = jest.spyOn(console, 'warn');

        const { getByText } = render(
            <AnalyticsContextProvider>
                <TestingComponent />
            </AnalyticsContextProvider>,
        );

        expect(getByText(/analytics/i)).toHaveTextContent('enabled');
        await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith(
                'Warning: You have not provided neither `newsroom`, nor `segmentWriteKey`. The library will not send any events.',
            ),
        );
    });

    it('Logs an error to console and fails gracefully when analytics fail to load', async () => {
        getConsentCookieMock.mockReturnValue(true);
        const consoleSpy = jest.spyOn(console, 'error');
        const analyticsSpy = jest.spyOn(AnalyticsBrowser, 'load');

        const error = new Error('Test Error');

        analyticsSpy.mockImplementationOnce(() => {
            throw error;
        });

        const { getByText } = render(
            <AnalyticsContextProvider>
                <TestingComponent />
            </AnalyticsContextProvider>,
        );

        expect(getByText(/analytics/i)).toHaveTextContent('enabled');
        await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith('Error while loading Analytics', error),
        );
    });
});

describe('useAnalyticsContext', () => {
    it('should throw an error when not inside the AnalyticsContext provider', () => {
        let caughtError: any = null;

        try {
            render(<TestingComponent />);
        } catch (error) {
            // TODO: This error is still logged to console, despite the `catch` block
            caughtError = error;
        }

        expect(caughtError).toEqual(
            Error('No `AnalyticsContextProvider` found when calling `useAnalyticsContext`'),
        );
    });

    it('should return context value when inside AnalyticsContext provider', async () => {
        getConsentCookieMock.mockReturnValue(true);

        const { getByText } = render(
            <AnalyticsContextProvider newsroom={DEFAULT_NEWSROOM}>
                <TestingComponent />
            </AnalyticsContextProvider>,
        );

        expect(getByText(/analytics/i)).toHaveTextContent('enabled');
    });
});
