import { ConsentCategory, TrackingPolicy } from '../types';
import type { Consent, TrackingPermissions } from '../types';

interface Arg {
    isEnabled: boolean;
    consent: Consent;
    trackingPolicy: TrackingPolicy;
}

export function getTrackingPermissions({ consent, trackingPolicy }: Arg): TrackingPermissions {
    const canIdentify = Boolean(
        trackingPolicy === TrackingPolicy.LENIENT ||
            consent.categories.includes(ConsentCategory.FIRST_PARTY_ANALYTICS) ||
            consent.categories.includes(ConsentCategory.THIRD_PARTY_COOKIES),
    );

    const canTrackToPrezly = Boolean(
        trackingPolicy !== TrackingPolicy.STRICT ||
            consent.categories.includes(ConsentCategory.FIRST_PARTY_ANALYTICS),
    );

    const canTrackToSegment = Boolean(
        trackingPolicy === TrackingPolicy.LENIENT ||
            consent.categories.includes(ConsentCategory.THIRD_PARTY_COOKIES),
    );

    const canTrackToGoogle = Boolean(
        trackingPolicy === TrackingPolicy.LENIENT ||
            consent.categories.includes(ConsentCategory.THIRD_PARTY_COOKIES),
    );

    const canTrackToPlausible = Boolean(
        trackingPolicy === TrackingPolicy.LENIENT ||
            consent.categories.includes(ConsentCategory.FIRST_PARTY_ANALYTICS),
    );

    return {
        canIdentify,
        canTrackToPrezly,
        canTrackToSegment,
        canLoadSegment: canTrackToPrezly || canTrackToSegment,
        canTrackToGoogle,
        canTrackToPlausible,
    };
}
