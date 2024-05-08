'use client';

import { useEffect, useState } from 'react';

import { useAnalyticsContext } from '../../context';
import { useCookieConsent } from '../../hooks';

interface InjectedCookieConsentProps {
    onAccept: () => void;
    onReject: () => void;
}

interface Props {
    children(props: InjectedCookieConsentProps): JSX.Element;
}

export function CookieConsentBar({ children }: Props) {
    const [mounted, setMounted] = useState(false);

    const { isEnabled, newsroom } = useAnalyticsContext();
    const {
        accept: onAccept,
        reject: onReject,
        isTrackingCookieAllowed,
        isNavigatorSupportsCookies,
    } = useCookieConsent();

    useEffect(() => setMounted(true), []);

    if (
        !mounted ||
        !isEnabled ||
        !isNavigatorSupportsCookies ||
        isTrackingCookieAllowed !== null ||
        newsroom?.onetrust_cookie_consent.is_enabled
    ) {
        return null;
    }

    return children({ onAccept, onReject });
}
