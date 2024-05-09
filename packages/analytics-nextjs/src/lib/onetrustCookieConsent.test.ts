import { getOnetrustCookieConsentStatus } from './onetrustCookieConsent';

describe('getOnetrustCookieConsentStatus', () => {
    it('should return `null` if the global OnetrustActiveGroups variable is not defined. ', () => {
        expect(getOnetrustCookieConsentStatus('C002')).toBe(null);
    });

    it('should return `true` if the global OnetrustActiveGroups variable contains the category of interest. ', () => {
        window.OnetrustActiveGroups = 'C001,C002,C003';
        expect(getOnetrustCookieConsentStatus('C002')).toBe(true);
    });

    it('should return `false` if the global OnetrustActiveGroups variable does not contain the category of interest. ', () => {
        window.OnetrustActiveGroups = 'C001,C003';
        expect(getOnetrustCookieConsentStatus('C002')).toBe(false);
    });
})

