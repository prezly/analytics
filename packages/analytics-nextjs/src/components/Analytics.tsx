'use client';

/* eslint-disable @typescript-eslint/no-use-before-define */

import { useSyncedRef } from '@react-hookz/web';
import { useEffect } from 'react';

import { ACTIONS } from '../events';
import { useAnalytics } from '../hooks';
import { getRecipientInfo, getUrlParameters } from '../lib';

import { UPLOADCARE_CDN_HOSTNAME } from './const';

export function Analytics() {
    const { alias, identify, track, user } = useAnalytics();
    const aliasRef = useSyncedRef(alias);
    const identifyRef = useSyncedRef(identify);
    const trackRef = useSyncedRef(track);
    const userRef = useSyncedRef(user);

    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (event.target instanceof HTMLElement) {
                const nearestAnchor = event.target.closest('a');

                if (nearestAnchor) {
                    const url = new URL(nearestAnchor.href);
                    const isExternalDomain = url.hostname !== window.location.hostname;
                    const isUploadcareCdn = url.hostname === UPLOADCARE_CDN_HOSTNAME;

                    if (isExternalDomain && !isUploadcareCdn) {
                        track(ACTIONS.OUTBOUND_LINK_CLICK, { href: nearestAnchor.href });
                    }
                }
            }
        }

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, [track]);

    useEffect(() => {
        const utm = getUrlParameters('utm_');
        const recipientId = utm.get('id');

        if (recipientId) {
            getRecipientInfo(recipientId)
                .then((data) => {
                    identifyRef.current(data.id);
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error(error);
                });
        }
    }, [aliasRef, identifyRef, userRef]);

    useEffect(() => {
        const hashParameters = window.location.hash.replace('#', '').split('-');

        const id = hashParameters.pop();
        const type = hashParameters.join('-');

        if (id && type) {
            // Auto-click assest passed in query parameters (used by campaign links)
            // Pulled from https://github.com/prezly/prezly/blob/9ac32bc15760636ed47eea6fe637d245fa752d32/apps/press/resources/javascripts/prezly.js#L425-L458
            const delay = type === 'image' || type === 'gallery-image' ? 500 : 0;
            window.setTimeout(() => {
                const targetEl =
                    document.getElementById(`${type}-${id}`) ||
                    // Fallback to data-attributes marked element
                    document.querySelector(`[data-type='${type}'][data-id='${id}']`);

                if (targetEl) {
                    targetEl.click();
                }
            }, delay);
        }
    }, [trackRef]);

    return null;
}
