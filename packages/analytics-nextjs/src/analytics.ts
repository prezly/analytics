import type { AnalyticsBrowser } from '@segment/analytics-next';
import type Plausible from 'plausible-tracker';
import type { PlausibleOptions } from 'plausible-tracker';

interface Config {
    isEnabled: boolean;
    plausibleOptions?: PlausibleOptions;
}

export class Analytics {
    public segment: AnalyticsBrowser | undefined = undefined;

    public plausible: ReturnType<typeof Plausible> | undefined = undefined;

    private config: Config;

    constructor(config: Config) {
        this.config = config;
        this.init();
    }

    async init() {
        const [{ AnalyticsBrowser }, { default: Plausible }] = await Promise.all([
            import('@segment/analytics-next'),
            import('plausible-tracker'),
        ]);

        this.segment = new AnalyticsBrowser();
        this.plausible = Plausible(this.config.plausibleOptions);
    }
}
