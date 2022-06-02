import 'jest-location-mock';

import { getUrlParameters } from './urlParameters';

describe('getUrlParameters', () => {
    afterEach(() => {
        window.location.assign('/');
    });

    it('should return empty Map with no search parameters', () => {
        expect(getUrlParameters('asset_')).toEqual(new Map());
    });

    it('should return empty Map with search parameters not matching the prefix', () => {
        window.location.assign('/?utm_id=abc');
        expect(window.location.search).toBe('?utm_id=abc');

        expect(getUrlParameters('asset_')).toEqual(new Map());
    });

    it('should return correct Map with search parameters matching the prefix', () => {
        window.location.assign('/?asset_id=abc');
        expect(window.location.search).toBe('?asset_id=abc');

        const assetParams = getUrlParameters('asset_');

        expect(assetParams.size).toBe(1);
        expect(assetParams.get('id')).toBe('abc');

        window.location.assign('/?utm_id=abc&utm_media=email');
        expect(window.location.search).toBe('?utm_id=abc&utm_media=email');

        const urmParams = getUrlParameters('utm_');

        expect(urmParams.size).toBe(2);
        expect(urmParams.get('id')).toBe('abc');
        expect(urmParams.get('media')).toBe('email');
    });
});

// TODO: Find a way to mock history.replaceState
// describe('stripUrlParameters', () => {});
