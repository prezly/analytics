import type { Newsroom, NewsroomGallery, StoryRef } from '@prezly/sdk';
import type { AnalyticsBrowserSettings, InitOptions } from '@segment/analytics-next';
import type { PlausibleOptions } from 'plausible-tracker';

export interface Identity {
    userId: string;
    traits?: object;
}

// Pulled from `@prezly/sdk` to get rid of direct dependency requirement
export enum TrackingPolicy {
    /**
     * @deprecated Please use `NORMAL` instead.
     */
    DEFAULT = 'default',
    DISABLED = 'disabled',
    /**
     * @deprecated Please use `STRICT` instead.
     */
    CONSENT_TO_IDENTIFY = 'consent-to-identify',

    STRICT = 'strict',
    NORMAL = 'normal',
    LENIENT = 'lenient',
}

export interface PrezlyMeta {
    newsroom: Newsroom['uuid'];
    story?: StoryRef['uuid'];
    gallery?: NewsroomGallery['uuid'];
    tracking_policy?: TrackingPolicy;
}

export enum ConsentCategory {
    NECESSARY = 'necessary',
    FIRST_PARTY_ANALYTICS = 'first-party-analytics',
    THIRD_PARTY_COOKIES = 'third-party-cookies',
}

export type Consent = {
    categories: ConsentCategory[];
};

export interface TrackingPermissions {
    canIdentify: boolean;
    canTrackToPrezly: boolean;
    canTrackToSegment: boolean;
    canTrackToGoogle: boolean;
    canLoadSegment: boolean;
    canTrackToPlausible: boolean;
}

export interface Config {
    consent?: Consent;
    trackingPolicy: TrackingPolicy;
    google?:
        | false
        | {
              analyticsId: string;
          };
    plausible?: false | PlausibleOptions;
    segment:
        | false
        | {
              settings: AnalyticsBrowserSettings;
              options?: InitOptions;
          };
}
