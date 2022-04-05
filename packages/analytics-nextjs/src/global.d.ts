import type { AnalyticsJS } from './types';

declare global {
    interface Window {
        analytics: AnalyticsJS;
    }
}
