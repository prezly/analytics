/* eslint-disable @typescript-eslint/no-use-before-define */

import type { Analytics, Integrations, Plugin, UserOptions } from '@segment/analytics-next';
import type { CookieOptions } from '@segment/analytics-next/dist/types/core/storage';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { GoogleAnalyticsIntegration } from './components/GoogleAnalyticsIntegration/GoogleAnalyticsIntegration';
import { OneTrust } from './components/OneTrust';
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
            <OneTrust newsroom={newsroom} />

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
