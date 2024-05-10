import { useAnalyticsContext } from '../AnalyticsProvider';

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
    const { consent, isTrackingCookieAllowed, setConsent, newsroom } = useAnalyticsContext();

    function accept() {
        if (newsroom?.onetrust_cookie_consent.is_enabled) {
            window.OneTrust?.ToggleInfoDisplay();
            return;
        }
        setConsent(true);
    }
    function reject() {
        if (newsroom?.onetrust_cookie_consent.is_enabled) {
            window.OneTrust?.ToggleInfoDisplay();
            return;
        }
        setConsent(false);
    }
    function toggle() {
        if (newsroom?.onetrust_cookie_consent.is_enabled) {
            window.OneTrust?.ToggleInfoDisplay();
            return;
        }
        setConsent(!consent);
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
