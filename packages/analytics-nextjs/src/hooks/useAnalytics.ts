import { TrackingPolicy } from '@prezly/sdk';
import { useCallback, useEffect } from 'react';
import { useLatest, useLocalStorage, useQueue } from 'react-use';

import { useAnalyticsContext } from '../context';
import { stringify } from '../lib';
import type { DeferredIdentity } from '../types';

const DEFERRED_IDENTITY_STORAGE_KEY = 'prezly_ajs_deferred_identity';

export function useAnalytics() {
    const { analytics, consent, isEnabled, newsroom, trackingPolicy } = useAnalyticsContext();
    const analyticsRef = useLatest(analytics);
    const [deferredIdentity, setDeferredIdentity, removeDeferredIdentity] =
        useLocalStorage<DeferredIdentity>(DEFERRED_IDENTITY_STORAGE_KEY);
    const {
        add: addToQueue,
        remove: removeFromQueue,
        first: firstInQueue,
    } = useQueue<Function>([]);

    const buildOptions = useCallback(() => {
        if (consent) {
            // No extra options
            return {};
        }

        /**
         * Mask IP address
         * @see https://segment.com/docs/sources/website/analytics.js/#anonymizing-ip
         */
        return {
            context: {
                ip: '0.0.0.0',
            },
        };
    }, [consent]);

    const identify = useCallback(
        (userId: string, traits: object = {}, callback?: () => void) => {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.log(`analytics.identify(${stringify(userId, traits)})`);
            }

            if (trackingPolicy === TrackingPolicy.CONSENT_TO_IDENTIFY && !consent) {
                setDeferredIdentity({ userId, traits });
                if (callback) {
                    callback();
                }

                return;
            }

            addToQueue(() => {
                if (analytics && analytics.identify) {
                    analytics.identify(userId, traits, buildOptions(), callback);
                }
            });
        },
        [analytics, addToQueue, buildOptions, consent, setDeferredIdentity, trackingPolicy],
    );

    function alias(userId: string, previousId: string) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log(`analytics.alias(${stringify(userId, previousId)})`);
        }

        addToQueue(() => {
            if (analytics && analytics.alias) {
                analytics.alias(userId, previousId, buildOptions());
            }
        });
    }

    function page(
        category?: string,
        name?: string,
        properties: object = {},
        callback?: () => void,
    ) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log(`analytics.page(${stringify(category, name, properties)})`);
        }

        addToQueue(() => {
            if (analyticsRef.current && analyticsRef.current.page) {
                analyticsRef.current.page(category, name, properties, buildOptions(), callback);
            }
        });
    }

    function track(event: string, properties: object = {}, callback?: () => void) {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log(`analytics.track(${stringify(event, properties)})`);
        }

        addToQueue(() => {
            if (analyticsRef.current && analyticsRef.current.track) {
                analyticsRef.current.track(event, properties, buildOptions(), callback);
            }
        });
    }

    const user = useCallback(() => {
        if (analytics && analytics.user) {
            return analytics.user();
        }

        // Return fake user API to keep code working even without analytics.js loaded
        return {
            id() {
                return null;
            },
        };
    }, [analytics]);

    useEffect(() => {
        // We are using simple queue to trigger tracking calls
        // that might have been created before analytics.js was loaded.
        if (analytics && firstInQueue) {
            firstInQueue();
            removeFromQueue();
        }
    }, [firstInQueue, analytics, removeFromQueue]);

    useEffect(() => {
        if (consent) {
            if (deferredIdentity) {
                const { userId, traits } = deferredIdentity;
                identify(userId, traits);
                removeDeferredIdentity();
            }
        } else {
            const id = user().id();
            if (id) {
                setDeferredIdentity({ userId: id });
            }

            user().id(null); // erase user ID
        }
    }, [consent, deferredIdentity, identify, user, removeDeferredIdentity, setDeferredIdentity]);

    if (!isEnabled) {
        return {
            alias: () => {},
            identify: () => {},
            page: () => {},
            track: () => {},
            user,
        };
    }

    // TODO: Expose all methods of analytics-next (might not be needed, since we already provide the `analytics` object)
    return {
        alias,
        identify,
        newsroom,
        page,
        track,
        user,
    };
}
