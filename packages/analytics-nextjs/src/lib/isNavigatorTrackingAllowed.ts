/**
 * - TRUE if tracking is allowed
 * - FALSE if tracking is disallowed
 * - NULL for "default" or "no preference"
 *
 * TODO: This property is marked as deprecated. Probably worth removing the `doNotTrack` check altogether
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack
 */
export function isNavigatorTrackingAllowed(): boolean | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!window.navigator.cookieEnabled) {
        // do not track if cookies are disabled
        return false;
    }

    const doNotTrack =
        // @ts-expect-error
        window.navigator.doNotTrack || window.doNotTrack || window.navigator.msDoNotTrack;

    if (doNotTrack === '1') {
        // do not track = enabled --> tracking is not allowed
        return false;
    }

    if (doNotTrack === '0') {
        // do not track = disabled --> tracking is allowed
        return true;
    }

    // no preference
    return null;
}
