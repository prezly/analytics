/* eslint-disable @typescript-eslint/no-use-before-define */

'use client';

import type { Analytics, Integrations, Plugin, UserOptions } from '@segment/analytics-next';
import type { CookieOptions } from '@segment/analytics-next/dist/types/core/storage';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { GoogleAnalyticsIntegration } from './components/GoogleAnalyticsIntegration/GoogleAnalyticsIntegration';
import { Plausible } from './components/Plausible';
import { Segment } from './components/Segment';
import {
    getConsentCookie,
    getOnetrustCookieConsentStatus,
    isTrackingCookieAllowed,
    setConsentCookie,
} from './lib';
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
    segmentWriteKey,
    story,
    user,
}: PropsWithChildren<Props>) {
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

    const shouldUsePlausible =
        isEnabled &&
        isPlausibleEnabled &&
        newsroom?.is_plausible_enabled &&
        newsroom?.tracking_policy !== TrackingPolicy.DISABLED;
    const shouldUseSegment = isEnabled && newsroom?.tracking_policy !== TrackingPolicy.DISABLED;

    return (
        <AnalyticsContext.Provider
            value={{
                // analytics,
                consent,
                gallery,
                isEnabled,
                isTrackingCookieAllowed: isTrackingCookieAllowed(consent, newsroom),
                newsroom,
                story,
                setConsent,
                // trackingPolicy,
            }}
        >
            {isOnetrustIntegrationEnabled && onetrustIntegrationScript && (
                <OnetrustCookieIntegration script={onetrustIntegrationScript} />
            )}

            <GoogleAnalyticsIntegration analyticsId={newsroom?.google_analytics_id ?? null} />

            {shouldUsePlausible && (
                <Plausible domain={plausibleDomain ?? newsroom.plausible_site_id} />
            )}

            {shouldUseSegment && (
                <Segment
                    cdnUrl={cdnUrl}
                    cookie={cookie}
                    integrations={integrations}
                    newsroom={newsroom}
                    plugins={plugins}
                    segmentWriteKey={segmentWriteKey}
                    user={user}
                />
            )}

            {children}
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

function noop() {
    // nothing
}
