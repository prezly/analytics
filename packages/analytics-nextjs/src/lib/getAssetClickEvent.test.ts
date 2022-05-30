import { STORY_ASSET, STORY_CONTACT, STORY_EMBED, STORY_FILE, STORY_IMAGE } from '../events';

import { getAssetClickEvent } from './getAssetClickEvent';

describe('getAssetClickEvent', () => {
    it('returns "Story Asset Click" by default', () => {
        expect(getAssetClickEvent('')).toBe(STORY_ASSET.CLICK);
    });

    it('returns correct event type for "attachment" type', () => {
        expect(getAssetClickEvent('attachment')).toBe(STORY_FILE.CLICK);
    });

    it('returns correct event type for "contact" type', () => {
        expect(getAssetClickEvent('contact')).toBe(STORY_CONTACT.CLICK);
    });

    it('returns correct event type for "embed" type', () => {
        expect(getAssetClickEvent('embed')).toBe(STORY_EMBED.CLICK);
    });

    it('returns correct event type for "image" type', () => {
        expect(getAssetClickEvent('image')).toBe(STORY_IMAGE.CLICK);
    });
});
