import type { TrackingPolicy } from './lib';

export interface DeferredIdentity {
    userId: string;
    traits?: object;
}

export interface RecipientInfo {
    campaign_id: number;
    id: string;
    recipient_id: string;
}

export interface PrezlyMeta {
    prezly: {
        newsroom: string;
        story?: string;
        tracking_policy?: TrackingPolicy;
    };
}
