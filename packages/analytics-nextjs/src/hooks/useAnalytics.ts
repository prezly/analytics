import { useLocalStorageValue, useQueue, useSyncedRef } from '@react-hookz/web';
import { useCallback, useEffect } from 'react';

import { useAnalyticsContext } from '../AnalyticsProvider';
import { stringify } from '../lib';
import type { DeferredIdentity, PrezlyMeta } from '../types';
import { TrackingPolicy } from '../types';

const DEFERRED_IDENTITY_STORAGE_KEY = 'prezly_ajs_deferred_identity';

const NULL_USER = {
    id() {
        return null;
    },
    anonymousId() {
        return null;
    },
};

export function useAnalytics() {
    const { analytics, consent, gallery, isEnabled, newsroom, story, trackingPolicy } =
        useAnalyticsContext();

    const { uuid: newsroomUuid } = newsroom || { uuid: undefined };
    const storyUuid = story?.uuid;
    const galleryUuid = gallery?.uuid;

    // We use ref to `analytics` object, cause our tracking calls are added to the callback queue, and those need to have access to the most recent instance if `analytics`,
    // which would not be possible when passing the `analytics` object directly
    const analyticsRef = useSyncedRef(analytics);

    const {
        value: deferredIdentity,
        set: setDeferredIdentity,
        remove: removeDeferredIdentity,
    } = useLocalStorageValue<DeferredIdentity>(DEFERRED_IDENTITY_STORAGE_KEY);
    const { add: addToQueue, remove: removeFromQueue, first: firstInQueue } = useQueue<Function>();

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
                    ...(galleryUuid && {
                        gallery: galleryUuid,
                    }),
                    ...(trackingPolicy !== TrackingPolicy.DEFAULT && {
                        tracking_policy: trackingPolicy,
                    }),
                },
            };
        },
        [galleryUuid, newsroomUuid, storyUuid, trackingPolicy],
    );

    const identify = useCallback(
        (userId: string, traits: object = {}, callback?: () => void) => {
            const extendedTraits = injectPrezlyMeta(traits);

            if (trackingPolicy === TrackingPolicy.CONSENT_TO_IDENTIFY && !consent) {
                setDeferredIdentity({ userId, traits: extendedTraits });
                if (callback) {
                    callback();
                }

                return;
            }

            addToQueue(() => {
                if (analyticsRef.current && analyticsRef.current.identify) {
                    analyticsRef.current.identify(userId, extendedTraits, {}, callback);
                }
            });
        },
        [addToQueue, analyticsRef, consent, setDeferredIdentity, trackingPolicy, injectPrezlyMeta],
    );

    const alias = useCallback(
        (userId: string, previousId: string) => {
            addToQueue(() => {
                if (analyticsRef.current && analyticsRef.current.alias) {
                    analyticsRef.current.alias(userId, previousId);
                }
            });
        },
        [addToQueue, analyticsRef],
    );

    const page = useCallback(
        (category?: string, name?: string, properties: object = {}, callback?: () => void) => {
            const extendedProperties = injectPrezlyMeta(properties);

            addToQueue(() => {
                if (analyticsRef.current && analyticsRef.current.page) {
                    analyticsRef.current.page(category, name, extendedProperties, {}, callback);
                }
            });
        },
        [addToQueue, analyticsRef, injectPrezlyMeta],
    );

    const track = useCallback(
        (event: string, properties: object = {}, callback?: () => void) => {
            const extendedProperties = injectPrezlyMeta(properties);

            addToQueue(() => {
                if (analyticsRef.current && analyticsRef.current.track) {
                    analyticsRef.current.track(event, extendedProperties, {}, callback);
                }
            });
        },
        [addToQueue, analyticsRef, injectPrezlyMeta],
    );

    const user = useCallback(() => {
        if (analytics && analytics.user) {
            return analytics.user();
        }

        // Return fake user API to keep code working even without analytics.js loaded
        return NULL_USER;
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
            if (id && deferredIdentity?.userId !== id) {
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
