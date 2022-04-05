import { useCookieConsent } from '../../hooks';

interface InjectedCookieConsentProps {
    onAccept: () => void;
    onReject: () => void;
}

interface Props {
    children(props: InjectedCookieConsentProps): JSX.Element;
}

export function CookieConsentBar({ children }: Props) {
    const {
        accept: onAccept,
        isTrackingAllowed,
        reject: onReject,
        supportsCookie,
    } = useCookieConsent();

    if (!supportsCookie || isTrackingAllowed !== null) {
        return null;
    }

    return children({ onAccept, onReject });
}
