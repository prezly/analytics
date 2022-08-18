import type { Newsroom, Story } from '@prezly/sdk';
import type { Options } from '@segment/analytics-next';

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
    DEFAULT = 'default',
    DISABLED = 'disabled',
    CONSENT_TO_IDENTIFY = 'consent-to-identify',
}

export type PickedNewsroomProperties = Pick<
    Newsroom,
    'uuid' | 'tracking_policy' | 'segment_analytics_id' | 'ga_tracking_id' | 'is_plausible_enabled'
>;

export type PickedStoryProperties = Pick<Story, 'uuid'>;

export interface PrezlyMeta {
    prezly: {
        newsroom: string;
        story?: string;
        tracking_policy?: TrackingPolicy;
    };
}

export interface PrezlyEventOptions extends Omit<Options, 'context'> {
    context: Omit<Exclude<Options['context'], undefined>, 'campaign'> & {
        campaign?: {
            // This property doesn't exist on the analytics-next type, but is used by Prezly analytics
            id: string;
            name?: string;
            term?: string;
            source: string;
            medium: string;
            content?: string;
        };
    };
}
