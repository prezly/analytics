import { getCookieConsentDomain } from './getCookieConsentDomain';

describe('getCookieConsentDomain', () => {
    it('returns document hostname by default', () => {
        expect(getCookieConsentDomain()).toBe(document.location.hostname);
    });

    it('returns custom domain when meta tag is present', () => {
        const customDomain = 'prezly.com';
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'prezly:cookie_consent_domain');
        meta.setAttribute('content', customDomain);
        document.head.appendChild(meta);

        expect(getCookieConsentDomain()).toBe(customDomain);
    });
});
