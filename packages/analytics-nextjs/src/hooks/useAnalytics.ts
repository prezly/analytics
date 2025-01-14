import { useLocalStorageValue, useQueue, useSyncedRef } from '@react-hookz/web';
import { useCallback, useEffect } from 'react';

import { useAnalyticsContext } from '../AnalyticsProvider';
import type { DeferredIdentity } from '../types';

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
    const { analytics, consent, newsroom, trackingPermissions } = useAnalyticsContext();

    // We use ref to `analytics` object, cause our tracking calls are added to the callback queue,
    // and those need to have access to the most recent instance if `analytics`
    const analyticsRef = useSyncedRef(analytics);

    const { value: deferredIdentity, set: setDeferredIdentity } =
        useLocalStorageValue<DeferredIdentity>(DEFERRED_IDENTITY_STORAGE_KEY);
    const { add: addToQueue, remove: removeFromQueue, first: firstInQueue } = useQueue<Function>();

    const identify = useCallback(
        (userId: string, traits: object = {}, callback?: () => void) => {
            if (!trackingPermissions.canIdentify) {
                setDeferredIdentity({ userId, traits });

                if (callback) {
                    callback();
                }

                return;
            }

            addToQueue(() => {
                analyticsRef.current?.identify(userId, traits, {}, callback);
            });
        },
        [addToQueue, analyticsRef, setDeferredIdentity, trackingPermissions.canIdentify],
    );

    const alias = useCallback(
        (userId: string, previousId: string) => {
            addToQueue(() => {
                analyticsRef.current?.alias(userId, previousId);
            });
        },
        [addToQueue, analyticsRef],
    );

    const page = useCallback(
        (category?: string, name?: string, properties: object = {}, callback?: () => void) => {
            addToQueue(() => {
                analyticsRef.current?.page(category, name, properties, {}, callback);
            });
        },
        [addToQueue, analyticsRef],
    );

    const track = useCallback(
        (event: string, properties: object = {}, callback?: () => void) => {
            addToQueue(() => {
                analyticsRef.current?.track(event, properties, {}, callback);
            });
        },
        [addToQueue, analyticsRef],
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
        if (trackingPermissions.canIdentify && deferredIdentity) {
            const { userId, traits } = deferredIdentity;
            analyticsRef.current?.identify(userId, traits);
        } else {
            const id = user().id();

            if (id && deferredIdentity?.userId !== id) {
                setDeferredIdentity({ userId: id });
            }

            user().id(null); // erase user ID
        }
    }, [
        consent,
        deferredIdentity,
        identify,
        user,
        setDeferredIdentity,
        analyticsRef,
        trackingPermissions.canIdentify,
    ]);

    return {
        alias,
        identify,
        newsroom,
        page,
        track,
        user,
    };
}
