import type { Newsroom, Story } from '@prezly/sdk';
import { TrackingPolicy } from '@prezly/sdk';
import type { Analytics, Plugin } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import Head from 'next/head';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { getConsentCookie, isPrezlyTrackingAllowed, setConsentCookie } from './lib';

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
    const { tracking_policy: trackingPolicy } = newsroom;
    const [consent, setConsent] = useState(getConsentCookie());

    const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined);
    // TODO: Expose Newsroom Segment Write key from API SDK
    // TODO: Load default Prezly write key
    const writeKey = 'SEGMENT_WRITE_KEY';

    useEffect(() => {
        async function loadAnalytics() {
            const [response] = await AnalyticsBrowser.load(
                {
                    writeKey,
                    plugins: [...(plugins || [])],
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

        if (trackingPolicy !== TrackingPolicy.DISABLED) {
            loadAnalytics();
        }
    }, [writeKey, trackingPolicy, plugins]);

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
                isTrackingAllowed: isEnabled && isPrezlyTrackingAllowed(consent, newsroom),
                newsroom,
                setConsent,
                trackingPolicy: newsroom.tracking_policy,
            }}
        >
            <Head>
                <meta name="prezly:newsroom" content={newsroom.uuid} />
                {story && <meta name="prezly:story" content={story.uuid} />}
                {newsroom.tracking_policy !== TrackingPolicy.DEFAULT && (
                    <meta name="prezly:tracking_policy" content={newsroom.tracking_policy} />
                )}
            </Head>
            {children}
        </AnalyticsContext.Provider>
    );
}
