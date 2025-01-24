import { ConsentCategory, TrackingPolicy } from '../types';
import type { Consent, TrackingPermissions } from '../types';

interface Arg {
    segmentWriteKey?: string;
    isEnabled?: boolean;
    isPlausibleEnabled: boolean;
    consent: Consent;
    trackingPolicy: TrackingPolicy;
}

export function getTrackingPermissions({
    segmentWriteKey,
    isEnabled,
    isPlausibleEnabled,
    consent,
    trackingPolicy,
}: Arg): TrackingPermissions {
    if (!isEnabled) {
        return {
            canIdentify: false,
            canTrackToPrezly: false,
            canTrackToSegment: false,
            canLoadSegment: false,
            canTrackToGoogle: false,
            canTrackToPlausible: false,
        };
    }

    const canTrackThirdParty = consent.categories.includes(ConsentCategory.THIRD_PARTY_COOKIES);
    const canTrackFirstParty =
        canTrackThirdParty || consent.categories.includes(ConsentCategory.FIRST_PARTY_ANALYTICS);

    const canIdentify = trackingPolicy === TrackingPolicy.LENIENT || canTrackFirstParty;
    const canTrackToPrezly =
        (trackingPolicy !== TrackingPolicy.STRICT &&
            trackingPolicy !== TrackingPolicy.CONSENT_TO_IDENTIFY) ||
        canTrackFirstParty;
    const canTrackToGoogle = trackingPolicy === TrackingPolicy.LENIENT || canTrackThirdParty;
    const canTrackToPlausible =
        isPlausibleEnabled && (trackingPolicy === TrackingPolicy.LENIENT || canTrackFirstParty);
    const canTrackToSegment =
        Boolean(segmentWriteKey) &&
        (trackingPolicy === TrackingPolicy.LENIENT || canTrackThirdParty);

    return {
        canIdentify,
        canTrackToPrezly,
        canTrackToSegment,
        canLoadSegment: canTrackToPrezly || canTrackToSegment,
        canTrackToGoogle,
        canTrackToPlausible,
    };
}
