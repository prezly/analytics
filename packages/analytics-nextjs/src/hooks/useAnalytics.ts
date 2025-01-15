import { useCallback, useEffect } from 'react';

import { useAnalyticsContext } from '../AnalyticsProvider';
import type { DeferredIdentity } from '../types';

import { useLatest } from './useLatest';
import { useLocalStorage } from './useLocalStorage';
import { useQueue } from './useQueue';

const DEFERRED_IDENTITY_STORAGE_KEY = 'prezly_ajs_deferred_identity';

const NULL_USER = {
    id(): null {
        return null;
    },
    anonymousId(): null {
        return null;
    },
};

export function useAnalytics() {
    const { analytics, consent, newsroom, trackingPermissions } = useAnalyticsContext();
    const analyticsRef = useLatest(analytics);

    const integrationsRef = useLatest({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Segment.io': trackingPermissions.canTrackToSegment,
        Prezly: trackingPermissions.canTrackToPrezly,
        Plausible: trackingPermissions.canTrackToPlausible,
    });

    const { value: deferredIdentity, set: setDeferredIdentity } = useLocalStorage<DeferredIdentity>(
        DEFERRED_IDENTITY_STORAGE_KEY,
    );
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
                analyticsRef.current?.identify(
                    userId,
                    traits,
                    { integrations: integrationsRef.current },
                    callback,
                );
            });
        },
        [
            addToQueue,
            analyticsRef,
            integrationsRef,
            setDeferredIdentity,
            trackingPermissions.canIdentify,
        ],
    );

    const alias = useCallback(
        (userId: string, previousId: string) => {
            addToQueue(() => {
                analyticsRef.current?.alias(userId, previousId, {
                    integrations: integrationsRef.current,
                });
            });
        },
        [addToQueue, analyticsRef, integrationsRef],
    );

    const page = useCallback(
        (category?: string, name?: string, properties: object = {}, callback?: () => void) => {
            addToQueue(() => {
                analyticsRef.current?.page(
                    category,
                    name,
                    properties,
                    { integrations: integrationsRef.current },
                    callback,
                );
            });
        },
        [addToQueue, analyticsRef, integrationsRef],
    );

    const track = useCallback(
        (event: string, properties: object = {}, callback?: () => void) => {
            addToQueue(() => {
                analyticsRef.current?.track(
                    event,
                    properties,
                    { integrations: integrationsRef.current },
                    callback,
                );
            });
        },
        [addToQueue, analyticsRef, integrationsRef],
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
        analyticsRef,
        alias,
        identify,
        newsroom,
        page,
        track,
        user,
    };
}
