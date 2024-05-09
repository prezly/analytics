'use client';

import { useEffect, useState } from 'react';

import { useAnalyticsContext } from '../../AnalyticsProvider';
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
    const { isEnabled } = useAnalyticsContext();
    const [mounted, setMounted] = useState(false);
    const { isTrackingCookieAllowed, isNavigatorSupportsCookies, toggle } = useCookieConsent();

    useEffect(() => setMounted(true), []);

    if (!mounted || !isEnabled || !isNavigatorSupportsCookies) {
        return null;
    }

    return (
        <button type="button" className={className} onClick={toggle}>
            {isTrackingCookieAllowed ? stopUsingCookiesLabel : startUsingCookiesLabel}
        </button>
    );
}
