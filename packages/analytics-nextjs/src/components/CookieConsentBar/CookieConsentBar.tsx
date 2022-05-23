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
    const { isEnabled } = useAnalyticsContext();
    const {
        accept: onAccept,
        isUserConsentGiven,
        reject: onReject,
        supportsCookie,
    } = useCookieConsent();

    if (!isEnabled || !supportsCookie || isUserConsentGiven !== null) {
        return null;
    }

    return children({ onAccept, onReject });
}
