'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { getOnetrustCookieConsentStatus } from '../lib';
import type { PickedNewsroomProperties } from '../types';

interface Props {
    newsroom?: PickedNewsroomProperties;
}

const ONETRUST_INTEGRATION_EVENT = 'OnetrustConsentModalCallback';

export function OneTrust({ newsroom }: Props) {
    const path = usePathname();
    const isOnetrustIntegrationEnabled = newsroom?.onetrust_cookie_consent.is_enabled ?? false;
    const onetrustCookieCategory = newsroom?.onetrust_cookie_consent?.category ?? '';
    const onetrustIntegrationScript = newsroom?.onetrust_cookie_consent?.script ?? '';

    /*
     * @see https://my.onetrust.com/s/article/UUID-69162cb7-c4a2-ac70-39a1-ca69c9340046?language=en_US#UUID-69162cb7-c4a2-ac70-39a1-ca69c9340046_section-idm46212287146848
     */
    useEffect(() => {
        document.getElementById('onetrust-consent-sdk')?.remove();

        if (window.OneTrust) {
            window.OneTrust.Init();

            setTimeout(() => {
                window.OneTrust?.LoadBanner();
            }, 1000);
        }
    }, [path]);

    useEffect(() => {
        if (!isOnetrustIntegrationEnabled || !onetrustCookieCategory) {
            return undefined;
        }

        function handleEvent() {
            setConsent(getOnetrustCookieConsentStatus(onetrustCookieCategory));
        }

        document.body.addEventListener(ONETRUST_INTEGRATION_EVENT, handleEvent);

        return () => {
            document.body.removeEventListener(ONETRUST_INTEGRATION_EVENT, handleEvent);
        };
    }, [isOnetrustIntegrationEnabled, onetrustCookieCategory]);

    return (
        <div
            id="onetrust-cookie-consent-integration"
            dangerouslySetInnerHTML={{
                __html: `
                    ${onetrustIntegrationScript}
                    <script>
                    window.OptanonWrapper = (function () {
                      const prev = window.OptanonWrapper || function() {};
                      return function() {
                        prev();
                        document.body.dispatchEvent(new Event("${ONETRUST_INTEGRATION_EVENT}")); // allow listening to the OptanonWrapper callback from anywhere.
                      };
                    })();
                    </script>`,
            }}
        />
    );
}
