import { type PickedNewsroomProperties, TrackingPolicy } from '../types';

import { isNavigatorTrackingAllowed } from './isNavigatorTrackingAllowed';

/**
 * - TRUE  - tracking allowed (i.e. user clicked "Allow")
 * - FALSE - tracking disallowed (i.e. user clicked "Disallow" or browser "Do Not Track" mode is ON)
 * - NULL  - unknown (i.e. user didn't click anything yet, and no browser preference set)
 */
export function isTrackingCookieAllowed(
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
