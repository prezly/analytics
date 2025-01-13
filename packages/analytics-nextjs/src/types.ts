import type { Newsroom, NewsroomGallery, Story, StoryRef } from '@prezly/sdk';

export interface DeferredIdentity {
    userId: string;
    traits?: object;
}

export interface RecipientInfo {
    campaign_id: number;
    id: string;
    recipient_id: string;
}

// Pulled from `@prezly/sdk` to get rid of direct dependency requirement
export enum TrackingPolicy {
    STRICT = 'strict',
    DEFAULT = 'default',
    WILD_WEST = 'wild-west',
    DISABLED = 'disabled',
    CONSENT_TO_IDENTIFY = 'consent-to-identify',
}

export type PickedNewsroomProperties = Pick<
    Newsroom,
    'uuid' | 'tracking_policy' | 'segment_analytics_id' | 'google_analytics_id'
>;

export type PickedStoryProperties = Pick<Story, 'uuid'>;

export type PickedGalleryProperties = Pick<NewsroomGallery, 'uuid'>;

export interface PrezlyMeta {
    prezly: {
        newsroom: Newsroom['uuid'];
        story?: StoryRef['uuid'];
        gallery?: NewsroomGallery['uuid'];
        tracking_policy?: TrackingPolicy;
    };
}

export enum ConsentCategory {
    NECESSARY = 'necessary',
    FIRST_PARTY_ANALYTICS = 'first-party-analytics',
    THIRD_PARTY_COOKIES = 'third-party-cookies',
}

export type Consent = Record<ConsentCategory, boolean> | null;

/**
 * - TRUE  - tracking allowed (i.e. user clicked "Allow")
 * - FALSE - tracking disallowed (i.e. user clicked "Disallow" or browser "Do Not Track" mode is ON)
 * - NULL  - unknown (i.e. user didn't click anything yet, and no browser preference set)
 */
export interface TrackingGroups {
    necessary: boolean | null;
    firstParty: boolean | null;
    thirdParty: boolean | null;
}
