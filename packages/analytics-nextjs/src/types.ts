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

export type PickedNewsroomProperties = Pick<
    Newsroom,
    | 'uuid'
    | 'tracking_policy'
    | 'segment_analytics_id'
    | 'google_analytics_id'
    | 'is_plausible_enabled'
    | 'plausible_site_id'
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
