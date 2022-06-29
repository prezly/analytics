import type { Analytics, Plugin } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { getConsentCookie, getUserTrackingConsent, setConsentCookie } from './lib';
import { normalizePrezlyMetaPlugin, sendEventToPrezlyPlugin } from './plugins';
import { type PickedNewsroomProperties, type PickedStoryProperties, TrackingPolicy } from './types';

interface Context {
    analytics: Analytics | undefined;
    consent: boolean | null;
    isEnabled: boolean;
    /**
     * - TRUE  - user clicked "Allow"
     * - FALSE - user clicked "Disallow" or browser "Do Not Track" is enabled
     * - NULL  - user didn't click anything yet
     */
    isUserConsentGiven: boolean | null;
    newsroom?: PickedNewsroomProperties;
    story?: PickedStoryProperties;
    setConsent: (consent: boolean) => void;
    trackingPolicy: TrackingPolicy;
}

interface Props {
    isEnabled?: boolean;
    newsroom?: PickedNewsroomProperties;
    story?: PickedStoryProperties;
    plugins?: Plugin[];
    segmentWriteKey?: string;
}

export const AnalyticsContext = createContext<Context | undefined>(undefined);

export function useAnalyticsContext() {
    const analyticsContext = useContext(AnalyticsContext);
    if (!analyticsContext) {
        throw new Error('No `AnalyticsContextProvider` found when calling `useAnalyticsContext`');
    }

    return analyticsContext;
}

export function AnalyticsContextProvider({
    children,
    isEnabled = true,
    newsroom,
    story,
    plugins,
    segmentWriteKey: customSegmentWriteKey,
}: PropsWithChildren<Props>) {
    const {
        tracking_policy: trackingPolicy,
        segment_analytics_id: segmentWriteKey,
        uuid,
    } = newsroom || {
        tracking_policy: TrackingPolicy.DEFAULT,
        segment_analytics_id: customSegmentWriteKey,
    };

    const [consent, setConsent] = useState(getConsentCookie());
    const isUserConsentGiven = getUserTrackingConsent(consent, newsroom);

    const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined);

    useEffect(() => {
        async function loadAnalytics(writeKey: string) {
            try {
                const [response] = await AnalyticsBrowser.load(
                    {
                        writeKey,
                        // If no Segment Write Key is provided, we initialize the library settings manually
                        ...(!writeKey && {
                            cdnSettings: {
                                integrations: {},
                            },
                        }),
                        plugins: [
                            ...(uuid
                                ? [sendEventToPrezlyPlugin(uuid), normalizePrezlyMetaPlugin()]
                                : []),
                            ...(plugins || []),
                        ],
                    },
                    {
                        // By default, the analytics.js library plants its cookies on the top-level domain.
                        // We need to completely isolate tracking between any Prezly newsroom hosted on a .prezly.com subdomain.
                        cookie: {
                            domain: document.location.host,
                        },
                        // Disable calls to Segment API completely if no Write Key is provided
                        ...(!writeKey && {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            integrations: { 'Segment.io': false },
                        }),
                    },
                );

                setAnalytics(response);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error while loading Analytics', error);
            }
        }

        if (isEnabled && trackingPolicy !== TrackingPolicy.DISABLED) {
            if (!segmentWriteKey && !uuid) {
                // eslint-disable-next-line no-console
                console.warn(
                    'Warning: You have not provided neither `newsroom`, nor `segmentWriteKey`. The library will not send any events.',
                );
            }
            loadAnalytics(segmentWriteKey || '');
        }
    }, [segmentWriteKey, isEnabled, trackingPolicy, uuid, plugins]);

    useEffect(() => {
        if (typeof consent === 'boolean') {
            setConsentCookie(consent);
        }
    }, [consent]);

    return (
        <AnalyticsContext.Provider
            value={{
                analytics,
                consent,
                isEnabled,
                isUserConsentGiven,
                newsroom,
                story,
                setConsent,
                trackingPolicy,
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
}
