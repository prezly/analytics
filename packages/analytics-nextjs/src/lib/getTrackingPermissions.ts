import { ConsentCategory, TrackingPolicy } from '../types';
import type { Consent, TrackingPermissions } from '../types';

interface Arg {
    segmentWriteKey?: string;
    consent: Consent;
    trackingPolicy: TrackingPolicy;
}

export function getTrackingPermissions({
    segmentWriteKey,
    consent,
    trackingPolicy,
}: Arg): TrackingPermissions {
    const canTrackThirdParty = consent.categories.includes(ConsentCategory.THIRD_PARTY_COOKIES);
    const canTrackFirstParty =
        canTrackThirdParty || consent.categories.includes(ConsentCategory.FIRST_PARTY_ANALYTICS);

    const canIdentify = trackingPolicy === TrackingPolicy.LENIENT || canTrackFirstParty;
    const canTrackToPrezly = trackingPolicy !== TrackingPolicy.STRICT || canTrackFirstParty;
    const canTrackToGoogle = trackingPolicy === TrackingPolicy.LENIENT || canTrackThirdParty;
    const canTrackToPlausible = trackingPolicy === TrackingPolicy.LENIENT || canTrackFirstParty;
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
