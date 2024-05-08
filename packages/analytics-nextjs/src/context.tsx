'use client';

import type { Analytics, Integrations, Plugin, UserOptions } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import type { CookieOptions } from '@segment/analytics-next/dist/types/core/storage';
import PlausibleProvider from 'next-plausible';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { getConsentCookie, isTrackingCookieAllowed, setConsentCookie } from './lib';
import { normalizePrezlyMetaPlugin, sendEventToPrezlyPlugin } from './plugins';
import { TrackingPolicy } from './types';
import type {
    PickedGalleryProperties,
    PickedNewsroomProperties,
    PickedStoryProperties,
} from './types';

interface Context {
    analytics: Analytics | undefined;
    consent: boolean | null;
    gallery?: PickedGalleryProperties;
    isEnabled: boolean;
    /**
     * - TRUE  - tracking allowed (i.e. user clicked "Allow")
     * - FALSE - tracking disallowed (i.e. user clicked "Disallow" or browser "Do Not Track" mode is ON)
     * - NULL  - unknown (i.e. user didn't click anything yet, and no browser preference set)
     */
    isTrackingCookieAllowed: boolean | null;
    newsroom?: PickedNewsroomProperties;
    setConsent: (consent: boolean) => void;
    story?: PickedStoryProperties;
    trackingPolicy: TrackingPolicy;
}

interface Props {
    cdnUrl?: string;
    cookie?: CookieOptions;
    gallery?: PickedGalleryProperties;
    integrations?: Integrations;
    isEnabled?: boolean;
    /**
     * Enables Plausible tracking for newsrooms that have regular tracking disabled.
     */
    isPlausibleEnabled?: boolean;
    newsroom?: PickedNewsroomProperties;
    story?: PickedStoryProperties;
    plugins?: Plugin[];
    segmentWriteKey?: string;
    plausibleDomain?: string;
    user?: UserOptions;
    /**
     * Skips user consent checks. Use cautiously.
     */
    ignoreConsent?: boolean;
}

export const AnalyticsContext = createContext<Context | undefined>(undefined);

export function useAnalyticsContext() {
    const analyticsContext = useContext(AnalyticsContext);
    if (!analyticsContext) {
        throw new Error('No `AnalyticsContextProvider` found when calling `useAnalyticsContext`');
    }

    return analyticsContext;
}

function PlausibleProviderMaybe({
    isEnabled,
    newsroom,
    plausibleDomain,
    children,
}: PropsWithChildren<Pick<Props, 'isEnabled' | 'newsroom' | 'plausibleDomain'>>) {
    if (
        !isEnabled ||
        !newsroom ||
        !newsroom.is_plausible_enabled ||
        newsroom.tracking_policy === TrackingPolicy.DISABLED
    ) {
        return <>{children}</>;
    }

    return (
        <PlausibleProvider
            domain={plausibleDomain ?? newsroom.plausible_site_id}
            scriptProps={{
                src: 'https://atlas.prezly.com/js/script.outbound-links.js',
                // This is a documented parameter, but it's not reflected in the types
                // See https://github.com/4lejandrito/next-plausible/blob/master/test/page/pages/scriptProps.js
                // @ts-expect-error
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'data-api': 'https://atlas.prezly.com/api/event',
            }}
        >
            {/* 
                This is the only way I found to test if the PlausibleProvider is rendered. 
                It doesn't render any markup by itself, and the `usePlausible` hook looks the same whether provider is present or not 
            */}
            {process.env.NODE_ENV === 'test' && <div data-testid="plausible-debug-enabled" />}
            {children}
        </PlausibleProvider>
    );
}

export function AnalyticsContextProvider({
    cdnUrl,
    children,
    cookie = {},
    gallery,
    ignoreConsent,
    integrations,
    isEnabled = true,
    isPlausibleEnabled,
    newsroom,
    plausibleDomain,
    plugins,
    segmentWriteKey: customSegmentWriteKey,
    story,
    user,
}: PropsWithChildren<Props>) {
    const {
        tracking_policy: trackingPolicy = TrackingPolicy.DEFAULT,
        segment_analytics_id: segmentWriteKey = customSegmentWriteKey,
        uuid,
    } = newsroom || {};

    const [consent, setConsent] = useState(ignoreConsent ? true : getConsentCookie());
    const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined);

    useEffect(() => {
        async function loadAnalytics(writeKey: string) {
            try {
                const [response] = await AnalyticsBrowser.load(
                    {
                        writeKey,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        cdnURL: cdnUrl,
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
                            ...cookie,
                        },
                        integrations,
                        user,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        cdnUrl,
        isEnabled,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(cookie),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(integrations),
        plugins,
        segmentWriteKey,
        trackingPolicy,
        user,
        uuid,
    ]);

    useEffect(() => {
        if (!ignoreConsent && typeof consent === 'boolean') {
            setConsentCookie(consent);
        }
    }, [consent, ignoreConsent]);

    return (
        <AnalyticsContext.Provider
            value={{
                analytics,
                consent,
                gallery,
                isEnabled,
                isTrackingCookieAllowed: isTrackingCookieAllowed(consent, newsroom),
                newsroom,
                story,
                setConsent,
                trackingPolicy,
            }}
        >
            <PlausibleProviderMaybe
                isEnabled={isEnabled || isPlausibleEnabled}
                newsroom={newsroom}
                plausibleDomain={plausibleDomain}
            >
                {children}
            </PlausibleProviderMaybe>
        </AnalyticsContext.Provider>
    );
}
