export const ACTIONS = {
    OUTBOUND_LINK_CLICK: 'Outbound link click',
    SEARCH: 'Search',
    SUBSCRIBE_FORM_SUBMIT: 'Subscribe form submit',
    SWITCH_LANGUAGE: 'Switch language',
    COPY_STORY_LINK: 'Newsroom - Story Page - Copy story link',
    COPY_STORY_TEXT: 'Newsroom - Story Page - Copy story text',
    SHARE_STORY_TO_SOCIAL_NETWORK(context: 'Gallery Page' | 'Story Page') {
        return `Newsroom - ${context} - Share story to social network`;
    },
    RELATED_STORY_OPEN: 'Newsroom - Story Page - Open related story',
};

export const DOWNLOAD = {
    ATTACHMENT: 'Attachment download',
    GALLERY_IMAGE: 'Gallery image download',
    IMAGE: 'Image download',
    MEDIA_GALLERY: 'Media gallery download',
    DOWNLOAD_STORY_PDF: 'Newsroom - Story Page - Download story PDF',
    DOWNLAOD_STORY_ASSETS: 'Newsroom - Story Page - Download story assets',
};

export const MEDIA = {
    PLAY: 'Media play',
};

export const VIEW = {
    GALLERY_IMAGE: 'Gallery image view',
    IMAGE: 'Image view',
};
