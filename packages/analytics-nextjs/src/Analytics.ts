import type { AnalyticsBrowser } from '@segment/analytics-next';
import type Plausible from 'plausible-tracker';
import type { PlausibleOptions } from 'plausible-tracker';

interface Config {
    isEnabled: boolean;
    plausibleOptions?: PlausibleOptions;
}

const NULL_USER = {
    id(): null {
        return null;
    },
    anonymousId(): null {
        return null;
    },
};

export class Analytics {
    public segment: AnalyticsBrowser | undefined = undefined;

    public plausible: ReturnType<typeof Plausible> | undefined = undefined;

    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public async init() {
        const [{ AnalyticsBrowser }, { default: Plausible }] = await Promise.all([
            import('@segment/analytics-next'),
            import('plausible-tracker'),
        ]);

        this.segment = new AnalyticsBrowser();
        this.plausible = Plausible(this.config.plausibleOptions);
    }

    public alias(userId: string, previousId: string) {
        this.segment?.alias(userId, previousId);
    }

    public page(category?: string, name?: string, properties: object = {}, callback?: () => void) {
        this.segment?.page(category, name, properties, callback);
    }

    public track(event: string, properties: object = {}, callback?: () => void) {
        this.segment?.track(event, properties, {}, callback);
        this.plausible?.trackEvent(event, properties);
    }

    public user() {
        return this.segment?.instance?.user() ?? NULL_USER;
    }
}
