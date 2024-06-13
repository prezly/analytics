import type { Integrations, Plugin, UserOptions } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import type { CookieOptions } from '@segment/analytics-next/dist/types/core/storage';
import { useEffect } from 'react';

import { normalizePrezlyMetaPlugin, sendEventToPrezlyPlugin } from '../plugins';
import { type PickedNewsroomProperties, TrackingPolicy } from '../types';

interface Props {
    cdnUrl?: string;
    cookie?: CookieOptions;
    integrations?: Integrations;
    newsroom?: PickedNewsroomProperties;
    plugins?: Plugin[];
    segmentWriteKey?: string;
    user?: UserOptions;
}

export function Segment({
    cdnUrl,
    cookie,
    integrations,
    newsroom,
    plugins,
    segmentWriteKey: customSegmentWriteKey,
    user,
}: Props) {
    const {
        tracking_policy: trackingPolicy = TrackingPolicy.DEFAULT,
        segment_analytics_id: segmentWriteKey = customSegmentWriteKey,
        uuid,
    } = newsroom || {};

    useEffect(() => {
        async function loadAnalytics(writeKey: string) {
            try {
                const [analytics] = await AnalyticsBrowser.load(
                    {
                        writeKey,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        cdnURL: cdnUrl,
                        // If no Segment Write Key is provided, we initialize the library settings manually
                        ...(!writeKey && {
                            cdnSettings: {
                                integrations: {},
                            },
                        }),
                        plugins: [
                            ...(uuid
                                ? [sendEventToPrezlyPlugin(uuid), normalizePrezlyMetaPlugin()]
                                : []),
                            ...(plugins || []),
                        ],
                    },
                    {
                        // By default, the analytics.js library plants its cookies on the top-level domain.
                        // We need to completely isolate tracking between any Prezly newsroom hosted on a .prezly.com subdomain.
                        cookie: {
                            domain: document.location.host,
                            ...cookie,
                        },
                        integrations,
                        user,
                        // Disable calls to Segment API completely if no Write Key is provided
                        ...(!writeKey && {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            integrations: { 'Segment.io': false },
                        }),
                    },
                );

                // TODO: save in state
                // setAnalytics(response);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error while loading Analytics', error);
            }
        }

        if (!segmentWriteKey && !uuid) {
            // eslint-disable-next-line no-console
            console.warn(
                'Warning: You have not provided neither `newsroom`, nor `segmentWriteKey`. The library will not send any events.',
            );
        }

        loadAnalytics(segmentWriteKey || '');

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        cdnUrl,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(cookie),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(integrations),
        plugins,
        segmentWriteKey,
        trackingPolicy,
        user,
        uuid,
    ]);

    return null;
}
