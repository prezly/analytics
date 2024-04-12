import fetchMock from 'jest-fetch-mock';

import type { RecipientInfo } from '../types';
import { getRecipientInfo, isRecipientIdFormat } from './getRecipientInfo';

fetchMock.enableMocks();

describe('isRecipientIdFormat', () => {
    it('should return `false` when argument is falsy', () => {
        expect(isRecipientIdFormat()).toBe(false);
        expect(isRecipientIdFormat('')).toBe(false);
        expect(isRecipientIdFormat(null)).toBe(false);
    });

    it("should return `false` when argument doesn't have the correct format", () => {
        expect(isRecipientIdFormat('random_invalid_id')).toBe(false);
    });

    it('should return `true` when argument has the correct format', () => {
        expect(isRecipientIdFormat('campaign_abcd_efgh.contact_zxcv_asdf')).toBe(true);
        expect(isRecipientIdFormat('prezly_123.campaign_123_456.contact_123_456')).toBe(true);
    });
});

describe('getRecipientInfo', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should return recipient info', async () => {
        const MOCKED_RESPONSE: RecipientInfo = { campaign_id: 123, id: 'abc', recipient_id: 'def' };

        // We don't need to mock all properties of the `fetch` response for this test
        // @ts-expect-error
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => MOCKED_RESPONSE,
        });

        const info = await getRecipientInfo('abc');
        expect(info).toEqual(MOCKED_RESPONSE);
    });

    it('should throw an error when request fails', async () => {
        // We don't need to mock all properties of the `fetch` response for this test
        // @ts-expect-error
        fetchMock.mockResolvedValueOnce({
            ok: false,
        });

        await expect(getRecipientInfo('abc')).rejects.toThrow(
            'Failed to fetch recipient with id: abc',
        );
    });
});
