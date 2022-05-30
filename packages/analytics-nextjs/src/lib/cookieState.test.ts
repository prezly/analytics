import Cookie from 'js-cookie';

import { COOKIE_EXPIRATION, COOKIE_NAME, getConsentCookie, setConsentCookie } from './cookieState';
import * as getCookieConsentDomainModule from './getCookieConsentDomain';

describe('getConsentCookie', () => {
    it('returns `null` when Cookie is not set', () => {
        const cookieSpy = jest.spyOn(Cookie, 'get');
        // @ts-ignore
        cookieSpy.mockReturnValueOnce(undefined);

        expect(getConsentCookie()).toBe(null);
    });

    it('returns the parsed Cookie value when it is set', () => {
        const cookieSpy = jest.spyOn(Cookie, 'get');
        // @ts-expect-error
        cookieSpy.mockReturnValueOnce(JSON.stringify(true));

        expect(getConsentCookie()).toBe(true);

        // @ts-expect-error
        cookieSpy.mockReturnValueOnce(JSON.stringify(false));

        expect(getConsentCookie()).toBe(false);
    });

    it('returns `null` when failed to parse Cookie', () => {
        const cookieSpy = jest.spyOn(Cookie, 'get');
        // @ts-ignore
        cookieSpy.mockReturnValueOnce({ test: 'test' });

        expect(getConsentCookie()).toBe(null);
    });
});

describe('setConsentCookie', () => {
    it('updates Cookies correctly', () => {
        const removeCookieSpy = jest.spyOn(Cookie, 'remove');
        const setCookieSpy = jest.spyOn(Cookie, 'set');
        const domainSpy = jest.spyOn(getCookieConsentDomainModule, 'getCookieConsentDomain');
        const TEST_DOMAIN = 'http://prezly.test';

        domainSpy.mockImplementation(() => TEST_DOMAIN);

        setConsentCookie(true);

        expect(removeCookieSpy).toHaveBeenCalledWith(COOKIE_NAME);
        expect(removeCookieSpy).toHaveBeenCalledWith(COOKIE_NAME, {
            domain: TEST_DOMAIN,
        });
        expect(setCookieSpy).toHaveBeenCalledWith(COOKIE_NAME, 'true', {
            expires: COOKIE_EXPIRATION,
            domain: TEST_DOMAIN,
        });
    });
});
