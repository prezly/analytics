import { type Config, type Consent, TrackingPolicy } from './types';

export const DEFAULT_PLAUSIBLE_API_HOST = 'https://atlas.prezly.com/api/event';

export const DEFAULT_CONSENT: Consent = { categories: [] };

export const DEFAULT_CONFIG: Config = {
    segment: {
        settings: {
            writeKey: '',
        },
        options: {},
    },
    trackingPolicy: TrackingPolicy.NORMAL,
};

export const NULL_USER = {
    id(): null {
        return null;
    },
    anonymousId(): null {
        return null;
    },
};
