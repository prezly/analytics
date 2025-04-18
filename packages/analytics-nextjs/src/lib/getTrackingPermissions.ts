import { ConsentCategory, TrackingPolicy } from '../types';
import type { Consent, TrackingPermissions } from '../types';

interface Arg {
    consent: Consent;
    trackingPolicy: TrackingPolicy;
}

export function getTrackingPermissions({ consent, trackingPolicy }: Arg): TrackingPermissions {
    const canTrackThirdParty = consent.categories.includes(ConsentCategory.THIRD_PARTY_COOKIES);
    const canTrackFirstParty =
        canTrackThirdParty || consent.categories.includes(ConsentCategory.FIRST_PARTY_ANALYTICS);

    const canTrackToPlausible = true; // Plausible is GDPR-compliant
    const canIdentify = trackingPolicy === TrackingPolicy.LENIENT || canTrackFirstParty;
    const canTrackToPrezly =
        (trackingPolicy !== TrackingPolicy.STRICT &&
            trackingPolicy !== TrackingPolicy.CONSENT_TO_IDENTIFY) ||
        canTrackFirstParty;
    const canTrackToGoogle = trackingPolicy === TrackingPolicy.LENIENT || canTrackThirdParty;
    const canTrackToSegment = trackingPolicy === TrackingPolicy.LENIENT || canTrackThirdParty;

    return {
        canIdentify,
        canTrackToPrezly,
        canTrackToSegment,
        canLoadSegment: canTrackToPrezly || canTrackToSegment,
        canTrackToGoogle,
        canTrackToPlausible,
    };
}
