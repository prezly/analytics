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
