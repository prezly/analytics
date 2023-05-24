import {
    STORY_ASSET,
    STORY_BOOKMARK,
    STORY_CONTACT,
    STORY_EMBED,
    STORY_FILE,
    STORY_IMAGE,
} from '../events';

export function getAssetClickEvent(type: string): string {
    switch (type) {
        case 'attachment':
            return STORY_FILE.CLICK;

        case 'contact':
            return STORY_CONTACT.CLICK;

        case 'embed':
            return STORY_EMBED.CLICK;

        case 'image':
            return STORY_IMAGE.CLICK;

        case 'story-bookmark':
            return STORY_BOOKMARK.CLICK;

        default:
            return STORY_ASSET.CLICK;
    }
}
