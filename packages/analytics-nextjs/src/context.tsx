import type { Newsroom, Story } from '@prezly/sdk';
import { TrackingPolicy } from '@prezly/sdk';
import type { Analytics, Plugin } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import Head from 'next/head';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { getConsentCookie, isPrezlyTrackingAllowed, setConsentCookie } from './lib';
import { injectPrezlyMetaPlugin } from './plugins';

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

const DEFAULT_WRITE_KEY = 'CwFkH8UbR05ByZJwLNvGzjwFr4DxGAUh';

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
    const { tracking_policy: trackingPolicy, segment_analytics_id: segmentWriteKey } = newsroom;
    const [consent, setConsent] = useState(getConsentCookie());
    const isTrackingAllowed = isEnabled && isPrezlyTrackingAllowed(consent, newsroom);

    const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined);

    useEffect(() => {
        async function loadAnalytics(writeKey: string) {
            const [response] = await AnalyticsBrowser.load(
                {
                    writeKey,
                    // TODO: Add plugin to send data to Prezly Analytics
                    plugins: [injectPrezlyMetaPlugin(), ...(plugins || [])],
                },
                {
                    // By default, the analytics.js library plants its cookies on the top-level domain.
                    // We need to completely isolate tracking between any Prezly newsroom hosted on a .prezly.com subdomain.
                    cookie: {
                        domain: document.location.host,
                    },
                },
            );
            setAnalytics(response);
        }

        if (isTrackingAllowed) {
            loadAnalytics(segmentWriteKey || DEFAULT_WRITE_KEY);
        }
    }, [segmentWriteKey, isTrackingAllowed, plugins]);

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
