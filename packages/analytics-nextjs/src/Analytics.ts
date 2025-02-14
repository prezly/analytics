/* eslint-disable no-underscore-dangle */

import type { AnalyticsBrowser, Plugin } from '@segment/analytics-next';
import type Plausible from 'plausible-tracker';

import {
    DEFAULT_PLAUSIBLE_API_HOST,
    DEFERRED_USER_LOCAL_STORAGE_KEY,
    NULL_USER,
} from './constants';
import { checkIsConsentEqual } from './lib/compareConsent';
import { getTrackingPermissions } from './lib/getTrackingPermissions';
import { logToConsole, normalizePrezlyMetaPlugin, sendEventToPrezlyPlugin } from './plugins';
import {
    type Config,
    type Consent,
    ConsentCategory,
    type Identity,
    type PrezlyMeta,
    TrackingPolicy,
} from './types';

export class Analytics {
    /* eslint-disable @typescript-eslint/naming-convention */
    private _identity: Identity | undefined;

    private _meta: PrezlyMeta | undefined;
    /* eslint-enable @typescript-eslint/naming-convention */

    public consent: Consent | undefined = undefined;

    public segment: AnalyticsBrowser | undefined;

    public plausible: ReturnType<typeof Plausible> | undefined;

    private config: Config | undefined;

    private promises: {
        segmentInit?: Promise<void>;
        plausibleInit?: Promise<void>;
        loadGoogleAnalytics?: Promise<(analyticsId: string) => void>;
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
        if (typeof this.config === 'undefined' || typeof this.consent === 'undefined') {
            throw new Error('Cannot check permissions before analytics initialization');
        }

        return getTrackingPermissions({
            consent: this.consent,
            trackingPolicy: this.config.trackingPolicy,
        });
    }

    get integrations() {
        return {
            Prezly: this.permissions.canTrackToPrezly,
            'Segment.io': this.permissions.canTrackToSegment,
        };
    }

    public init = async (config: Config) => {
        if (this.config) {
            // Cannot re-initialize analytics
            return;
        }

        this.config = config;

        this.promises.segmentInit =
            config.segment === false
                ? Promise.resolve()
                : import('@segment/analytics-next').then(({ AnalyticsBrowser }) => {
                      this.segment = new AnalyticsBrowser();
                  });

        this.promises.plausibleInit =
            config.plausible === false
                ? Promise.resolve()
                : import('plausible-tracker').then(({ default: Plausible }) => {
                      this.plausible = Plausible({
                          apiHost: DEFAULT_PLAUSIBLE_API_HOST,
                          ...config.plausible,
                      });
                  });

        if (config.google) {
            const { analyticsId } = config.google;
            window[`ga-disable-${analyticsId}`] = config.trackingPolicy !== TrackingPolicy.LENIENT;
            import('./lib/loadGoogleAnalytics').then(({ loadGoogleAnalytics }) => {
                loadGoogleAnalytics(analyticsId);
            });
        }

        if (config.trackingPolicy === TrackingPolicy.LENIENT) {
            this.setConsent({
                categories: [
                    ConsentCategory.NECESSARY,
                    ConsentCategory.FIRST_PARTY_ANALYTICS,
                    ConsentCategory.THIRD_PARTY_COOKIES,
                ],
            });
        } else if (config.consent) {
            this.setConsent(config.consent);
        }

        if (config.meta) {
            this.setMeta(config.meta);
        }
    };

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
                integrations: this.integrations,
                cookie: {
                    domain: document.location.host,
                },
                ...options,
            },
        );
    }

    public setMeta = (meta: PrezlyMeta) => {
        this._meta = meta;
    };

    private get meta() {
        if (!this._meta) {
            console.warn('Tracking without Prezly meta being set');
        }

        return this._meta;
    }

    public setConsent = (consent: Consent) => {
        if (!this.config) {
            throw new Error('Cannot set consent before analytics initialization');
        }

        if (checkIsConsentEqual(consent, this.consent)) {
            return;
        }

        this.consent = consent;

        if (this.config?.google) {
            const { analyticsId } = this.config.google;
            window[`ga-disable-${analyticsId}`] = !this.permissions.canTrackToGoogle;
        }

        this.promises.segmentInit?.then(() => {
            if (!this.segment?.instance && this.permissions.canLoadSegment) {
                this.loadSegment();
            }

            const { identity } = this;
            if (identity && this.permissions.canIdentify) {
                this.segment?.identify(
                    identity.userId,
                    { ...identity.traits, prezly: this.meta },
                    { integrations: this.integrations },
                );
            }
        });
    };

    public alias = async (userId: string, previousId: string) => {
        await this.promises.segmentInit;
        await this.segment?.alias(userId, previousId, { integrations: this.integrations });
    };

    public page = async (
        category?: string,
        name?: string,
        properties: object = {},
        callback?: () => void,
    ) => {
        await this.promises.segmentInit;
        await this.segment?.page(
            category,
            name,
            { ...properties, prezly: this.meta },
            { integrations: this.integrations },
            callback,
        );
    };

    public track = async (event: string, properties: object = {}, callback?: () => void) => {
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
    };

    public identify = async (userId: string, traits: object = {}, callback?: () => void) => {
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
    };

    public user() {
        return this.segment?.instance?.user() ?? NULL_USER;
    }
}
