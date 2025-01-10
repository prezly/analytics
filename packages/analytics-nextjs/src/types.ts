import type { Newsroom, NewsroomGallery, Story } from '@prezly/sdk';

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
        newsroom: string;
        story?: string;
        tracking_policy?: TrackingPolicy;
    };
}

export enum ConsentCategory {
    NECESSARY = 'necessary',
    FIRST_PARTY_ANALYTICS = 'first-party-analytics',
    THIRD_PARTY_COOKIES = 'third-party-cookies',
}

export type Consent = Record<ConsentCategory, boolean> | null;
