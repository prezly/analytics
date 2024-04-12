import type { RecipientInfo } from '../types';

import { getApiUrl } from './getApiUrl';

export function isRecipientIdFormat(id?: string | null): id is string {
    if (!id) {
        return false;
    }

    return /(prezly_\w+\.)?campaign_\w+_\w+\.contact_\w+_\w+/.test(id);
}

export async function getRecipientInfo(recipientId: string): Promise<RecipientInfo> {
    const url = getApiUrl();
    const response = await fetch(`${url}/recipients?id=${recipientId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch recipient with id: ${recipientId}`);
    }

    return response.json();
}
