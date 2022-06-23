import { type PickedNewsroomProperties, TrackingPolicy } from '../types';

import { isNavigatorTrackingAllowed } from './isNavigatorTrackingAllowed';

/**
 * - TRUE  - user clicked "Allow"
 * - FALSE - user clicked "Disallow" or browser "Do Not Track" is enabled
 * - NULL  - user didn't click anything yet
 */
export function getUserTrackingConsent(
    consent: boolean | null,
    newsroom?: PickedNewsroomProperties,
): boolean | null {
    if (newsroom?.tracking_policy === TrackingPolicy.DISABLED) {
        return false;
    }

    if (consent !== null) {
        return consent;
    }

    if (isNavigatorTrackingAllowed() === false) {
        return false; // "Disallow tracking" -- no need to ask consent
    }

    // Both "Allow navigator tracking" and "no preference" require us to ask a consent.
    return null;
}
