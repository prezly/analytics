/* eslint-disable @typescript-eslint/no-use-before-define */

'use client';

import type { Analytics, Integrations, Plugin, UserOptions } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import type { CookieOptions } from '@segment/analytics-next/dist/types/core/storage';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import PlausibleProvider from 'next-plausible';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import {
    getConsentCookie,
    getOnetrustCookieConsentStatus,
    isTrackingCookieAllowed,
    setConsentCookie,
} from './lib';
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
    setConsent(consent: boolean): void;
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

const ONETRUST_INTEGRATION_EVENT = 'OnetrustConsentModalCallback';

export const AnalyticsContext = createContext<Context | undefined>(undefined);

export function useAnalyticsContext() {
    const analyticsContext = useContext(AnalyticsContext);
    if (!analyticsContext) {
        throw new Error('No `AnalyticsProvider` found when calling `useAnalyticsContext`');
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

export function AnalyticsProvider({
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

    const isOnetrustIntegrationEnabled = newsroom?.onetrust_cookie_consent.is_enabled ?? false;
    const onetrustCookieCategory = newsroom?.onetrust_cookie_consent?.category ?? '';
    const onetrustIntegrationScript = newsroom?.onetrust_cookie_consent?.script ?? '';

    const [consent, setConsent] = useState<boolean | null>(() => {
        if (ignoreConsent) {
            return true;
        }
        if (isOnetrustIntegrationEnabled) {
            return getOnetrustCookieConsentStatus(onetrustCookieCategory);
        }
        return getConsentCookie();
    });
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
        if (!ignoreConsent && typeof consent === 'boolean' && !isOnetrustIntegrationEnabled) {
            setConsentCookie(consent);
        }
    }, [consent, ignoreConsent, isOnetrustIntegrationEnabled]);

    useEffect(() => {
        if (!isOnetrustIntegrationEnabled || !onetrustCookieCategory) {
            // Only execute the effect if the OneTrust integration is enabled.
            return noop;
        }

        function handleEvent() {
            setConsent(getOnetrustCookieConsentStatus(onetrustCookieCategory));
        }

        document.body.addEventListener(ONETRUST_INTEGRATION_EVENT, handleEvent);

        return () => {
            document.body.removeEventListener(ONETRUST_INTEGRATION_EVENT, handleEvent);
        };
    }, [isOnetrustIntegrationEnabled, onetrustCookieCategory]);

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
            {isOnetrustIntegrationEnabled && onetrustIntegrationScript && (
                <OnetrustCookieIntegration script={onetrustIntegrationScript} />
            )}
            <GoogleAnalyticsIntegration analyticsId={newsroom?.google_analytics_id ?? null} />
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

function OnetrustCookieIntegration(props: { script: string }) {
    const path = usePathname();

    /*
     * @see https://my.onetrust.com/s/article/UUID-69162cb7-c4a2-ac70-39a1-ca69c9340046?language=en_US#UUID-69162cb7-c4a2-ac70-39a1-ca69c9340046_section-idm46212287146848
     */
    useEffect(() => {
        document.getElementById('onetrust-consent-sdk')?.remove();

        if (window.OneTrust) {
            window.OneTrust.Init();

            setTimeout(() => {
                window.OneTrust?.LoadBanner();
            }, 1000);
        }
    }, [path]);

    return (
        <div
            id="onetrust-cookie-consent-integration"
            dangerouslySetInnerHTML={{
                __html: `
                    ${props.script}
                    <script>
                    window.OptanonWrapper = (function () {
                      const prev = window.OptanonWrapper || function() {};
                      return function() {
                        prev();
                        document.body.dispatchEvent(new Event("${ONETRUST_INTEGRATION_EVENT}")); // allow listening to the OptanonWrapper callback from anywhere.
                      };
                    })();
                    </script>`,
            }}
        />
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

function noop() {
    // nothing
}
