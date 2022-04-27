import type { Newsroom, Story } from '@prezly/sdk';
import type { Analytics, Plugin } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import Head from 'next/head';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { getConsentCookie, isPrezlyTrackingAllowed, setConsentCookie, TrackingPolicy } from './lib';
import { injectPrezlyMetaPlugin, sendEventToPrezlyPlugin } from './plugins';

interface Context {
    analytics: Analytics | undefined;
    consent: boolean | null;
    isEnabled: boolean;
    isTrackingAllowed: boolean | null;
    newsroom: Newsroom;
    setConsent: (consent: boolean) => void;
    trackingPolicy: TrackingPolicy;
}

interface Props {
    isEnabled?: boolean;
    newsroom: Newsroom;
    story: Story | undefined;
    plugins?: Plugin[];
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
}: PropsWithChildren<Props>) {
    const {
        tracking_policy: trackingPolicy,
        segment_analytics_id: segmentWriteKey,
        uuid,
    } = newsroom;
    const [consent, setConsent] = useState(getConsentCookie());
    const isTrackingAllowed = isEnabled && isPrezlyTrackingAllowed(consent, newsroom);

    const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined);

    useEffect(() => {
        async function loadAnalytics(writeKey: string) {
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
                        injectPrezlyMetaPlugin(),
                        sendEventToPrezlyPlugin(uuid),
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
        }

        if (isTrackingAllowed) {
            loadAnalytics(segmentWriteKey || '');
        }
    }, [segmentWriteKey, isTrackingAllowed, uuid, plugins]);

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
                isTrackingAllowed,
                newsroom,
                setConsent,
                trackingPolicy,
            }}
        >
            <Head>
                <meta name="prezly:newsroom" content={newsroom.uuid} />
                {story && <meta name="prezly:story" content={story.uuid} />}
                {trackingPolicy !== TrackingPolicy.DEFAULT && (
                    <meta name="prezly:tracking_policy" content={trackingPolicy} />
                )}
            </Head>
            {children}
        </AnalyticsContext.Provider>
    );
}
