import { usePrevious, useSyncedRef } from '@react-hookz/web';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { useEffect } from 'react';

import { CAMPAIGN } from '../events';
import { useAnalytics } from '../hooks';
import {
    getAssetClickEvent,
    getRecipientInfo,
    getUrlParameters,
    isRecipientIdFormat,
    stripUrlParameters,
} from '../lib';

export function Analytics() {
    const { alias, identify, newsroom, page, track, user } = useAnalytics();
    const aliasRef = useSyncedRef(alias);
    const identifyRef = useSyncedRef(identify);
    const trackRef = useSyncedRef(track);
    const userRef = useSyncedRef(user);
    const { asPath: currentPath } = useRouter();
    const previousPath = usePrevious(currentPath);

    useEffect(() => {
        if (currentPath !== previousPath) {
            page();
        }
    }, [currentPath, page, previousPath]);

    useEffect(() => {
        const userId = userRef.current().id();
        const utm = getUrlParameters('utm_');
        const id = utm.get('id');
        const source = utm.get('source');
        const medium = utm.get('medium');

        if (id && source === 'email' && medium === 'campaign') {
            getRecipientInfo(id)
                .then((data) => {
                    // re-map current user to the correct identifier
                    if (userRef.current().id() === data.recipient_id) {
                        aliasRef.current(data.id, id);
                    }

                    identifyRef.current(data.id);
                    trackRef.current(CAMPAIGN.CLICK, { recipient_id: data.recipient_id }, () =>
                        stripUrlParameters('utm_'),
                    );
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error(error);
                });
        } else if (id && isRecipientIdFormat(userId)) {
            getRecipientInfo(userId)
                .then((data) => {
                    // re-map current user to the correct identifier
                    if (userRef.current().id() === data.recipient_id) {
                        aliasRef.current(data.id, id);
                    }

                    identifyRef.current(data.id);
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error(error);
                });
        }
    }, [aliasRef, identifyRef, trackRef, userRef]);

    useEffect(() => {
        const asset = getUrlParameters('asset_');
        const id = asset.get('id');
        const type = asset.get('type');

        if (id && type) {
            trackRef.current(getAssetClickEvent(type), { id, type }, () =>
                stripUrlParameters('asset_'),
            );

            // Auto-click assest passed in query parameters (used by campaign links)
            // Pulled from https://github.com/prezly/prezly/blob/9ac32bc15760636ed47eea6fe637d245fa752d32/apps/press/resources/javascripts/prezly.js#L425-L458
            const delay = type === 'image' || type === 'gallery-image' ? 500 : 0;
            window.setTimeout(() => {
                let targetEl = document.getElementById(`${type}-${id}`);
                if (!targetEl) {
                    // Fallback to data-attributes marked element
                    targetEl = document.querySelector(`[data-type='${type}'][data-id='${id}']`);
                }

                if (targetEl) {
                    targetEl.click();
                }
            }, delay);
        }
    }, [trackRef]);

    if (newsroom?.ga_tracking_id) {
        return (
            <>
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${newsroom.ga_tracking_id}`}
                />
                <Script
                    id="google-tag-manager-bootstrap"
                    dangerouslySetInnerHTML={{
                        __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${newsroom.ga_tracking_id}');
                `,
                    }}
                />
            </>
        );
    }

    return null;
}
