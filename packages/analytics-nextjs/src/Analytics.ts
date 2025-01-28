import type { AnalyticsBrowser, Plugin } from '@segment/analytics-next';
import type Plausible from 'plausible-tracker';

import { DEFAULT_CONSENT, DEFAULT_PLAUSIBLE_API_HOST, NULL_USER } from './constants';
import { getTrackingPermissions } from './lib';
import { logToConsole, normalizePrezlyMetaPlugin, sendEventToPrezlyPlugin } from './plugins';
import type { Config, Consent, PrezlyMeta } from './types';

export class Analytics {
    private meta: PrezlyMeta | undefined;

    public consent: Consent = DEFAULT_CONSENT;

    public segment: AnalyticsBrowser | undefined;

    public plausible: ReturnType<typeof Plausible> | undefined;

    private config: Config | undefined;

    get permissions() {
        return getTrackingPermissions({
            consent: this.consent,
            trackingPolicy: this.config!.trackingPolicy,
        });
    }

    public async init(config: Config) {
        this.config = config;

        import('@segment/analytics-next').then(({ AnalyticsBrowser }) => {
            this.segment = new AnalyticsBrowser();
        });

        import('plausible-tracker').then(({ default: Plausible }) => {
            this.plausible = Plausible({
                apiHost: DEFAULT_PLAUSIBLE_API_HOST,
                ...config.plausibleOptions,
            });
        });
    }

    private loadSegment() {
        if (this.config?.segment === false) {
            return;
        }

        const { settings, options } = this.config!.segment;

        this.segment?.load(
            {
                ...settings,
                ...(!settings.writeKey && {
                    cdnSettings: {
                        integrations: {},
                    },
                }),
                plugins: [
                    sendEventToPrezlyPlugin(),
                    normalizePrezlyMetaPlugin(),
                    process.env.NODE_ENV === 'production' ? null : logToConsole(),
                    ...(settings.plugins || []),
                ].filter((value): value is Plugin => value !== null),
            },
            {
                cookie: {
                    domain: document.location.host,
                },
                ...options,
                integrations: {
                    Prezly: this.permissions.canTrackToPrezly,
                    'Segment.io': this.permissions.canTrackToSegment,
                    ...options?.integrations,
                },
            },
        );
    }

    public setMeta(meta: PrezlyMeta) {
        this.meta = meta;
    }

    public setConsent(consent: Consent) {
        this.consent = consent;

        if (!this.segment?.instance && this.permissions.canLoadSegment) {
            this.loadSegment();
        }

        if (this.segment?.instance?.options) {
            this.segment.instance.options.integrations = {
                ...this.segment?.instance?.options.integrations,
                Prezly: this.permissions.canTrackToPrezly,
                'Segment.io': this.permissions.canTrackToSegment,
            };
        }
    }

    public alias(userId: string, previousId: string) {
        this.segment?.alias(userId, previousId);
    }

    public page(category?: string, name?: string, properties: object = {}, callback?: () => void) {
        this.segment?.page(category, name, { ...properties, prezly: this.meta }, callback);
    }

    public track(event: string, properties: object = {}, callback?: () => void) {
        const props = this.meta ? { ...properties, prezly: this.meta } : properties;
        this.segment?.track(event, props, {}, callback);
        this.plausible?.trackEvent(event, {
            props: props as Record<string, string | number | boolean>,
        });
    }

    public identify(userId: string, traits: object = {}, callback?: () => void) {
        this.segment?.identify(userId, { ...traits, prezly: this.meta }, callback);
    }

    public user() {
        return this.segment?.instance?.user() ?? NULL_USER;
    }
}
