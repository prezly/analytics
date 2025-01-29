import fetchMock from 'jest-fetch-mock';

import type { RecipientInfo } from '../../../types';
import { getRecipientInfo } from './getRecipientInfo';

fetchMock.enableMocks();

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
