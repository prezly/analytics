'use client';

import { useSyncedRef } from '@react-hookz/web';
import Script from 'next/script';
import { useEffect } from 'react';

import { ACTIONS } from '../events';
import { useAnalytics } from '../hooks';
import { getRecipientInfo, getUrlParameters, isRecipientIdFormat } from '../lib';

import { UPLOADCARE_CDN_HOSTNAME } from './const';

export function Analytics() {
    const { alias, identify, newsroom, track, user } = useAnalytics();
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
        const userId = userRef.current().id();
        const utm = getUrlParameters('utm_');
        const id = utm.get('id');

        if (id && isRecipientIdFormat(userId)) {
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

    if (newsroom?.ga_tracking_id && newsroom?.ga_tracking_id.startsWith('GTM-')) {
        return (
            <>
                <Script
                    id="google-tag-manager-bootstrap"
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${newsroom.ga_tracking_id}');
                        `,
                    }}
                />
                <noscript>
                    {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
                    <iframe
                        src={`https://www.googletagmanager.com/ns.html?id=${newsroom.ga_tracking_id}`}
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                    />
                </noscript>
            </>
        );
    }

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
