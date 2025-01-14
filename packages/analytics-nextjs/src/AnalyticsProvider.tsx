/* eslint-disable @typescript-eslint/no-use-before-define */

'use client';

import type { Analytics, Integrations, Plugin, UserOptions } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import type { CookieOptions } from '@segment/analytics-next/dist/types/core/storage';
import Script from 'next/script';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { useLatest } from './hooks';
import { getTrackingPermissions } from './lib';
import { injectPrezlyMetaPlugin, logToConsole, sendEventToPrezlyPlugin } from './plugins';
import { TrackingPolicy } from './types';
import type {
    Consent,
    PickedGalleryProperties,
    PickedNewsroomProperties,
    PickedStoryProperties,
    PrezlyMeta,
    TrackingPermissions,
} from './types';

interface Context {
    analytics: Analytics | undefined;
    consent: Consent | null;
    gallery?: PickedGalleryProperties;
    newsroom?: PickedNewsroomProperties;
    story?: PickedStoryProperties;
    trackingPermissions: TrackingPermissions;
    trackingPolicy: TrackingPolicy;
}

interface Props {
    cdnUrl?: string;
    consent: Consent | null;
    cookie?: CookieOptions;
    gallery?: PickedGalleryProperties;
    integrations?: Integrations;
    newsroom?: PickedNewsroomProperties;
    story?: PickedStoryProperties;
    plugins?: Plugin[];
    segmentWriteKey?: string;
    user?: UserOptions;
}

export const AnalyticsContext = createContext<Context | undefined>(undefined);

export function useAnalyticsContext() {
    const analyticsContext = useContext(AnalyticsContext);
    if (!analyticsContext) {
        throw new Error('No `AnalyticsProvider` found when calling `useAnalyticsContext`');
    }

    return analyticsContext;
}

export function AnalyticsProvider({
    cdnUrl,
    children,
    cookie = {},
    consent,
    gallery,
    integrations,
    newsroom,
    plugins,
    segmentWriteKey: customSegmentWriteKey,
    story,
    user,
}: PropsWithChildren<Props>) {
    const {
        tracking_policy: trackingPolicy = TrackingPolicy.DEFAULT as TrackingPolicy,
        segment_analytics_id: segmentWriteKey = customSegmentWriteKey,
        google_analytics_id: googleAnalyticsId,
        uuid,
    } = newsroom || {};

    const prezlyMeta: PrezlyMeta['prezly'] | null = newsroom
        ? {
              newsroom: newsroom?.uuid,
              story: story?.uuid,
              gallery: gallery?.uuid,
              // TODO: remove directive when Newsroom type is updated
              // @ts-expect-error
              trackingPolicy,
          }
        : null;
    const prezlyMetaRef = useLatest(prezlyMeta);

    const [analytics, setAnalytics] = useState<Analytics | undefined>(undefined);

    // TODO: remove directive when Newsroom type is updated
    // @ts-expect-error
    const trackingPermissions = getTrackingPermissions({ trackingPolicy, consent });

    useEffect(() => {
        if (!googleAnalyticsId) {
            return;
        }

        window[`ga-disable-${googleAnalyticsId}`] = !trackingPermissions.canTrackToGoogle;
    }, [googleAnalyticsId, trackingPermissions]);

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
                                ? [
                                      ...(trackingPermissions.canTrackToPrezly
                                          ? [sendEventToPrezlyPlugin(uuid)]
                                          : []),
                                      injectPrezlyMetaPlugin(prezlyMetaRef),
                                  ]
                                : []),
                            ...(process.env.NODE_ENV === 'production' ? [] : [logToConsole()]),
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
                        // Disable calls to Segment API completely if no Write Key is provided or user hasn't given consent
                        ...((!writeKey || !trackingPermissions.canTrackToSegment) && {
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

        if (trackingPermissions.canLoadSegment) {
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
        prezlyMetaRef,
        trackingPermissions,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(cookie),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(integrations),
        plugins,
        segmentWriteKey,
        user,
        uuid,
    ]);

    return (
        <AnalyticsContext.Provider
            value={{
                analytics,
                consent: null,
                gallery,
                newsroom,
                story,
                trackingPermissions,
                trackingPolicy,
            }}
        >
            <GoogleAnalyticsIntegration analyticsId={newsroom?.google_analytics_id ?? null} />
            {children}
        </AnalyticsContext.Provider>
    );
}

function GoogleAnalyticsIntegration(props: { analyticsId: string | null }) {
    if (props.analyticsId?.startsWith('GTM-')) {
        return <GoogleTagManager analyticsId={props.analyticsId as `GTM-${string}`} />;
    }
    if (props.analyticsId) {
        return <GoogleAnalytics analyticsId={props.analyticsId} />;
    }
    return null;
}

function GoogleTagManager(props: { analyticsId: `GTM-${string}` }) {
    return (
        <>
            <Script
                id="google-tag-manager-bootstrap"
                dangerouslySetInnerHTML={{
                    __html: `
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${props.analyticsId}');
                        `,
                }}
            />
            <noscript>
                {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${props.analyticsId}`}
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                />
            </noscript>
        </>
    );
}

function GoogleAnalytics(props: { analyticsId: string }) {
    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${props.analyticsId}`} />
            <Script
                id="google-tag-manager-bootstrap"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${props.analyticsId}');
                        `,
                }}
            />
        </>
    );
}
