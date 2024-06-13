import { GoogleAnalytics } from './GoogleAnalytix';
import { GoogleTagManager } from './GoogleTagManager';

export function GoogleAnalyticsIntegration(props: { analyticsId: string | null }) {
    if (props.analyticsId?.startsWith('GTM-')) {
        return <GoogleTagManager analyticsId={props.analyticsId as `GTM-${string}`} />;
    }
    if (props.analyticsId) {
        return <GoogleAnalytics analyticsId={props.analyticsId} />;
    }
    return null;
}
