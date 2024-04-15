import type { RecipientInfo } from '../types';

import { getApiUrl } from './getApiUrl';

export async function getRecipientInfo(recipientId: string): Promise<RecipientInfo> {
    const url = getApiUrl();
    const response = await fetch(`${url}/recipients?id=${recipientId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch recipient with id: ${recipientId}`);
    }

    return response.json();
}
