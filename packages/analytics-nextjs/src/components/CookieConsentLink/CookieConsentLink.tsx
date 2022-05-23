import { useCookieConsent } from '../../hooks';

interface Props {
    className?: string;
    startUsingCookiesLabel?: string;
    stopUsingCookiesLabel?: string;
}

export function CookieConsentLink({
    className,
    startUsingCookiesLabel = 'Start using cookies',
    stopUsingCookiesLabel = 'Stop using cookies',
}: Props) {
    const { isUserConsentGiven, supportsCookie, toggle } = useCookieConsent();

    if (!supportsCookie) {
        return null;
    }

    return (
        <button type="button" className={className} onClick={toggle}>
            {isUserConsentGiven ? startUsingCookiesLabel : stopUsingCookiesLabel}
        </button>
    );
}
