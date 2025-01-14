import { TrackingPolicy } from '../types';
import type { Consent, TrackingPermissions } from '../types';

interface Arg {
    isEnabled: boolean;
    consent: Consent;
    trackingPolicy: TrackingPolicy;
}

export function getTrackingPermissions({ consent, trackingPolicy }: Arg): TrackingPermissions {
    const canIdentify = Boolean(
        trackingPolicy === TrackingPolicy.LENIENT ||
            consent?.['first-party-analytics'] ||
            consent?.['third-party-cookies'],
    );

    const canTrackToPrezly = Boolean(
        trackingPolicy !== TrackingPolicy.STRICT || consent?.['first-party-analytics'],
    );

    const canTrackToSegment = Boolean(
        trackingPolicy === TrackingPolicy.LENIENT || consent?.['third-party-cookies'],
    );

    const canTrackToGoogle = Boolean(
        trackingPolicy === TrackingPolicy.LENIENT || consent?.['third-party-cookies'],
    );

    const canTrackToPlausible = Boolean(
        trackingPolicy === TrackingPolicy.LENIENT || consent?.['first-party-analytics'],
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
