/* eslint-disable no-underscore-dangle */

import type { AnalyticsBrowser, Plugin } from '@segment/analytics-next';
import type Plausible from 'plausible-tracker';

import {
    DEFAULT_CONSENT,
    DEFAULT_PLAUSIBLE_API_HOST,
    DEFERRED_USER_LOCAL_STORAGE_KEY,
    NULL_USER,
} from './constants';
import { getTrackingPermissions } from './lib/getTrackingPermissions';
import { logToConsole, normalizePrezlyMetaPlugin, sendEventToPrezlyPlugin } from './plugins';
import type { Config, Consent, Identity, PrezlyMeta } from './types';

export class Analytics {
    private _identity: Identity | undefined;

    private meta: PrezlyMeta | undefined;

    public consent: Consent = DEFAULT_CONSENT;

    public segment: AnalyticsBrowser | undefined;

    public plausible: ReturnType<typeof Plausible> | undefined;

    private config: Config | undefined;

    private promises: {
        segmentInit?: Promise<void>;
        plausibleInit?: Promise<void>;
    } = {};

    get identity(): Identity | undefined {
        if (this._identity) {
            return this._identity;
        }

        try {
            const stringifiedIdentity = localStorage.getItem(DEFERRED_USER_LOCAL_STORAGE_KEY);
            return stringifiedIdentity ? JSON.parse(stringifiedIdentity) : undefined;
        } catch {
            return undefined;
        }
    }

    set identity(identity: Identity) {
        this._identity = identity;
        localStorage.setItem(DEFERRED_USER_LOCAL_STORAGE_KEY, JSON.stringify(identity));
    }

    get permissions() {
        return getTrackingPermissions({
            consent: this.consent,
            trackingPolicy: this.config!.trackingPolicy,
        });
    }

    get isInitialized() {
        return Boolean(this.config);
    }

    get integrations() {
        return {
            Prezly: this.permissions.canTrackToPrezly,
            'Segment.io': this.permissions.canTrackToSegment,
        };
    }

    public async init(config: Config) {
        if (this.isInitialized) {
            return;
        }

        this.config = config;

        if (config.segment !== false) {
            this.promises.segmentInit = import('@segment/analytics-next').then(
                ({ AnalyticsBrowser }) => {
                    this.segment = new AnalyticsBrowser();
                },
            );
        }

        if (config.plausible !== false) {
            this.promises.plausibleInit = import('plausible-tracker').then(
                ({ default: Plausible }) => {
                    this.plausible = Plausible({
                        apiHost: DEFAULT_PLAUSIBLE_API_HOST,
                        ...config.plausible,
                    });
                },
            );
        }

        if (config.google) {
            import('./lib/loadGoogleAnalytics').then(({ loadGoogleAnalytics }) => {
                // @ts-ignore
                loadGoogleAnalytics(config.google.analyticsId);
            });
        }
    }

    private async loadSegment() {
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
            },
        );
    }

    public setMeta(meta: PrezlyMeta) {
        this.meta = meta;
    }

    public setConsent(consent: Consent) {
        if (!this.isInitialized) {
            throw new Error('Analytics uninitialized');
        }

        this.consent = consent;

        const googleAnalyticsId = this.config?.google?.analyticsId;
        if (googleAnalyticsId) {
            window[`ga-disable-${googleAnalyticsId}`] = this.permissions.canTrackToGoogle;
        }

        this.promises.segmentInit?.then(() => {
            if (!this.segment?.instance && this.permissions.canLoadSegment) {
                this.loadSegment();
            }

            if (this.identity && this.permissions.canIdentify) {
                const { identity } = this;
                this.segment?.identify(
                    identity.userId,
                    { ...identity.traits, prezly: this.meta },
                    { integrations: this.integrations },
                );
            }
        });
    }

    public async alias(userId: string, previousId: string) {
        await this.promises.segmentInit;
        await this.segment?.alias(userId, previousId, { integrations: this.integrations });
    }

    public async page(
        category?: string,
        name?: string,
        properties: object = {},
        callback?: () => void,
    ) {
        await this.promises.segmentInit;
        await this.segment?.page(
            category,
            name,
            { ...properties, prezly: this.meta },
            { integrations: this.integrations },
            callback,
        );
    }

    public async track(event: string, properties: object = {}, callback?: () => void) {
        const props = this.meta ? { ...properties, prezly: this.meta } : properties;

        await Promise.all([
            this.promises.plausibleInit?.then(() => {
                this.plausible?.trackEvent(event, {
                    props: props as Record<string, string | number | boolean>,
                });
            }),

            this.promises.segmentInit?.then(() =>
                this.segment?.track(event, props, { integrations: this.integrations }, callback),
            ),
        ]);
    }

    public async identify(userId: string, traits: object = {}, callback?: () => void) {
        this.identity = { userId, traits };

        await this.promises.segmentInit;

        if (this.permissions.canIdentify) {
            await this.segment?.identify(
                userId,
                { ...traits, prezly: this.meta },
                { integrations: this.integrations },
                callback,
            );
        }
    }

    public user() {
        return this.segment?.instance?.user() ?? NULL_USER;
    }
}
