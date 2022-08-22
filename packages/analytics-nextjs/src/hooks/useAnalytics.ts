import { useLocalStorageValue, useSyncedRef } from '@react-hookz/web';
import type { Options } from '@segment/analytics-next';
import { usePlausible } from 'next-plausible';
import { useCallback, useEffect } from 'react';

import { useAnalyticsContext } from '../context';
import { getUrlParameters, stringify } from '../lib';
import type { DeferredIdentity, PrezlyEventOptions, PrezlyMeta } from '../types';
import { TrackingPolicy } from '../types';
import { version } from '../version';

import { useQueue } from './useQueue';

const DEFERRED_IDENTITY_STORAGE_KEY = 'prezly_ajs_deferred_identity';

export function useAnalytics() {
    const { analytics, consent, isEnabled, newsroom, story, trackingPolicy } =
        useAnalyticsContext();
    const plausible = usePlausible();

    const { uuid: newsroomUuid, is_plausible_enabled: isPlausibleEnabled } = newsroom || {
        uuid: undefined,
        is_plausible_enabled: false,
    };
    const { uuid: storyUuid } = story || { uuid: undefined };

    // We use ref to `analytics` object, cause our tracking calls are added to the callback queue, and those need to have access to the most recent instance if `analytics`,
    // which would not be possible when passing the `analytics` object directly
    const analyticsRef = useSyncedRef(analytics);
    const plausibleRef = useSyncedRef(plausible);

    const [deferredIdentity, setDeferredIdentity, removeDeferredIdentity] =
        useLocalStorageValue<DeferredIdentity>(DEFERRED_IDENTITY_STORAGE_KEY);
    const {
        add: addToQueue,
        remove: removeFromQueue,
        first: firstInQueue,
    } = useQueue<Function>([]);

    const buildOptions = useCallback(() => {
        const utm = getUrlParameters('utm_');
        const id = utm.get('id');
        const source = utm.get('source');
        const medium = utm.get('medium');

        const options: PrezlyEventOptions = {
            context: {
                library: {
                    name: '@prezly/analytics-next',
                    version,
                },
                ...(medium === 'campaign' &&
                    source &&
                    id && {
                        campaign: {
                            id,
                            source,
                            medium,
                        },
                    }),
            },
            // TODO: Legacy implementation also sends `sentAt` field in the root of the event, which is the same as `timestamp`. Need to check if any server logic depends on that.
            timestamp: new Date(),
        };

        // Only inject user information when consent is given
        if (consent) {
            options.context!.userAgent = navigator.userAgent;
        }

        return options as Options;
    }, [consent]);

    // The prezly traits should be placed in the root of the event when sent to the API.
    // This is handled by the `normalizePrezlyMeta` plugin.
    const injectPrezlyMeta = useCallback(
        (traits: object): object | (object & PrezlyMeta) => {
            if (!newsroomUuid) {
                return traits;
            }

            return {
                ...traits,
                prezly: {
                    newsroom: newsroomUuid,
                    ...(storyUuid && {
                        story: storyUuid,
                    }),
                    ...(trackingPolicy !== TrackingPolicy.DEFAULT && {
                        tracking_policy: trackingPolicy,
                    }),
                },
            };
        },
        [newsroomUuid, storyUuid, trackingPolicy],
    );

    const identify = useCallback(
        (userId: string, traits: object = {}, callback?: () => void) => {
            const extendedTraits = injectPrezlyMeta(traits);

            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.log(`analytics.identify(${stringify(userId, extendedTraits)})`);
            }

            if (trackingPolicy === TrackingPolicy.CONSENT_TO_IDENTIFY && !consent) {
                setDeferredIdentity({ userId, traits: extendedTraits });
                if (callback) {
                    callback();
                }

                return;
            }

            addToQueue(() => {
                if (analyticsRef.current && analyticsRef.current.identify) {
                    analyticsRef.current.identify(userId, extendedTraits, buildOptions(), callback);
                }
            });
        },
        [
            addToQueue,
            analyticsRef,
            buildOptions,
            consent,
            setDeferredIdentity,
            trackingPolicy,
            injectPrezlyMeta,
        ],
    );

    const alias = useCallback(
        (userId: string, previousId: string) => {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.log(`analytics.alias(${stringify(userId, previousId)})`);
            }

            addToQueue(() => {
                if (analyticsRef.current && analyticsRef.current.alias) {
                    analyticsRef.current.alias(userId, previousId, buildOptions());
                }
            });
        },
        [addToQueue, analyticsRef, buildOptions],
    );

    const page = useCallback(
        (category?: string, name?: string, properties: object = {}, callback?: () => void) => {
            const extendedProperties = injectPrezlyMeta(properties);

            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.log(`analytics.page(${stringify(category, name, extendedProperties)})`);
            }

            addToQueue(() => {
                if (analyticsRef.current && analyticsRef.current.page) {
                    analyticsRef.current.page(
                        category,
                        name,
                        extendedProperties,
                        buildOptions(),
                        callback,
                    );
                }
            });
        },
        [addToQueue, analyticsRef, buildOptions, injectPrezlyMeta],
    );

    const track = useCallback(
        (event: string, properties: object = {}, callback?: () => void) => {
            const extendedProperties = injectPrezlyMeta(properties);

            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.log(`analytics.track(${stringify(event, extendedProperties)})`);
            }

            addToQueue(() => {
                if (analyticsRef.current && analyticsRef.current.track) {
                    analyticsRef.current.track(event, extendedProperties, buildOptions(), callback);
                }
                if (isPlausibleEnabled) {
                    plausibleRef.current(event, { props: extendedProperties });
                }
            });
        },
        [
            addToQueue,
            analyticsRef,
            buildOptions,
            injectPrezlyMeta,
            isPlausibleEnabled,
            plausibleRef,
        ],
    );

    const user = useCallback(() => {
        if (analytics && analytics.user) {
            return analytics.user();
        }

        // Return fake user API to keep code working even without analytics.js loaded
        return {
            id() {
                return null;
            },
            anonymousId() {
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

    if (!isEnabled || trackingPolicy === TrackingPolicy.DISABLED) {
        return {
            alias: () => {},
            identify: () => {},
            page: () => {},
            track: () => {},
            user,
        };
    }

    return {
        alias,
        identify,
        newsroom,
        page,
        track,
        user,
    };
}
