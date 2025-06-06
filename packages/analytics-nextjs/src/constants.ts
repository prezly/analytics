import { type Config, TrackingPolicy } from './types';

export const DEFERRED_USER_LOCAL_STORAGE_KEY = 'identity';

export const DEFAULT_PLAUSIBLE_API_HOST = 'https://atlas.prezly.com';

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
