import { useAnalyticsContext } from '../context';

interface State {
    // API
    accept(): void;
    reject(): void;
    toggle(): void;
    /**
     * - TRUE  - tracking allowed (i.e. user clicked "Allow")
     * - FALSE - tracking disallowed (i.e. user clicked "Disallow" or browser "Do Not Track" mode is ON)
     * - NULL  - unknown (i.e. user didn't click anything yet, and no browser preference set)
     */
    isTrackingCookieAllowed: boolean | null;
    isNavigatorSupportsCookies: boolean;
}

export function useCookieConsent(): State {
    const { consent, isTrackingCookieAllowed, setConsent } = useAnalyticsContext();

    function accept() {
        return setConsent(true);
    }
    function reject() {
        return setConsent(false);
    }
    function toggle() {
        return setConsent(!consent);
    }

    return {
        // flags
        isTrackingCookieAllowed,
        isNavigatorSupportsCookies: typeof navigator !== 'undefined' && navigator.cookieEnabled,
        // API
        accept,
        reject,
        toggle,
    };
}
