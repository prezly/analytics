'use client';

/* eslint-disable @typescript-eslint/no-use-before-define */

import { useEffect, useRef } from 'react';

import type { Analytics } from '../../Analytics';
import { ACTIONS } from '../../events';

import { getRecipientInfo } from './lib/getRecipientInfo';
import { getUrlParameters } from './lib/getUrlParameters';

export const UPLOADCARE_CDN_HOSTNAME = 'cdn.uc.assets.prezly.com';

export function Tracking({ analytics }: { analytics: Analytics }) {
    const { alias, identify, track, user } = analytics;
    const aliasRef = useRef(alias);
    const identifyRef = useRef(identify);
    const trackRef = useRef(track);
    const userRef = useRef(user);

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
