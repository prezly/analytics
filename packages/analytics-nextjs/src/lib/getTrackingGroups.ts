import { TrackingPolicy } from '../types';
import type { Consent, TrackingGroups } from '../types';

import { isNavigatorTrackingAllowed } from './isNavigatorTrackingAllowed';

interface Arg {
    isEnabled: boolean;
    consent: Consent;
    trackingPolicy: TrackingPolicy;
}

export function getTrackingGroups({ consent, trackingPolicy }: Arg): TrackingGroups {
    if (trackingPolicy === TrackingPolicy.DISABLED) {
        return { firstParty: false, necessary: false, thirdParty: false };
    }

    if (trackingPolicy === TrackingPolicy.WILD_WEST) {
        return { firstParty: true, necessary: true, thirdParty: true };
    }

    const isBrowserTrackingAllowed = isNavigatorTrackingAllowed() ?? null;

    return {
        firstParty: consent?.['first-party-analytics'] ?? isBrowserTrackingAllowed,
        necessary: consent?.necessary ?? isBrowserTrackingAllowed,
        thirdParty: consent?.['third-party-cookies'] ?? isBrowserTrackingAllowed,
    };
}
