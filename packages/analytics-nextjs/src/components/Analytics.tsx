'use client';

import { usePrevious, useSyncedRef } from '@react-hookz/web';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

import { useAnalyticsContext } from '../context';
import { useAnalytics } from '../hooks';

export function Analytics() {
    const { newsroom, page, track } = useAnalytics();
    const { onPageView } = useAnalyticsContext();
    const trackRef = useSyncedRef(track);
    const currentPath = usePathname();
    const previousPath = usePrevious(currentPath);

    useEffect(() => {
        if (currentPath && currentPath !== previousPath) {
            const data = onPageView?.() || {};
            page(undefined, undefined, data);
        }
    }, [currentPath, onPageView, page, previousPath]);

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
