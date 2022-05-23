import { useAnalyticsContext } from '../context';

interface State {
    accept: () => void;
    /**
     * - TRUE  - user clicked "Allow"
     * - FALSE - user clicked "Disallow" or browser "Do Not Track" is enabled
     * - NULL  - user didn't click anything yet
     */
    isUserConsentGiven: boolean | null;
    reject: () => void;
    supportsCookie: boolean;
    toggle: () => void;
}

export function useCookieConsent(): State {
    const { consent, isUserConsentGiven, setConsent } = useAnalyticsContext();

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
        accept,
        isUserConsentGiven,
        reject,
        supportsCookie: typeof navigator !== 'undefined' && navigator.cookieEnabled,
        toggle,
    };
}
