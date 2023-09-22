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

    const { isEnabled } = useAnalyticsContext();
    const {
        accept: onAccept,
        isUserConsentGiven,
        reject: onReject,
        supportsCookie,
    } = useCookieConsent();

    useEffect(() => setMounted(true), []);

    if (!mounted || !isEnabled || !supportsCookie || isUserConsentGiven !== null) {
        return null;
    }

    return children({ onAccept, onReject });
}
