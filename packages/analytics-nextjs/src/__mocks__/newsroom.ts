import type { Newsroom } from '@prezly/sdk';
import { EmailBrandingMode, NewsroomStatus, TextDirection, TrackingPolicy } from '@prezly/sdk';

/**
 * Pulled from The Good News Room
 */
export const DEFAULT_NEWSROOM: Newsroom = {
    uuid: '578e78e9-9a5b-44ad-bda2-5214895ee036',
    id: 12698,
    name: 'The Good News Room',
    display_name: 'The Good News Room',
    subdomain: 'the-good-news-room',
    thumbnail_url:
        'https://avatars-cdn.prezly.com/newsroom/12698/e4939974b7781d4c61e282713116690387e9b7b1f6302478b13b68e18e0d3055?t=1648556918&v=1',
    timezone: 'europe/london',
    is_active: true,
    is_archived: false,
    is_online: true,
    is_offline: false,
    is_multilingual: true,
    is_indexable: true,
    is_plausible_enabled: false,
    plausible_site_id: '',
    plausible_stats: {
        visits_last_7_days: null,
        visits_last_7_days_previous: null,
    },
    url: 'https://the-good-news-room.prezly.com/',
    links: {
        media_gallery_api: 'https://api.prezly.com/v1/rooms/12698/media',
        analytics_and_visibility_settings:
            'https://rock.prezly.com/pressroom/the-good-news-room/ga',
        categories_management:
            'https://rock.prezly.com/settings/newsrooms/578e78e9-9a5b-44ad-bda2-5214895ee036/categories',
        company_info_settings:
            'https://rock.prezly.com/settings/newsrooms/578e78e9-9a5b-44ad-bda2-5214895ee036/information',
        contacts_management:
            'https://rock.prezly.com/settings/newsrooms/578e78e9-9a5b-44ad-bda2-5214895ee036/contacts',
        domain_settings: 'https://rock.prezly.com/pressroom/the-good-news-room/domain',
        edit: 'https://rock.prezly.com/settings/newsrooms/578e78e9-9a5b-44ad-bda2-5214895ee036/information',
        gallery_management: 'https://rock.prezly.com/pressroom/the-good-news-room/gallery',
        hub_settings: 'https://rock.prezly.com/pressroom/the-good-news-room/hub',
        languages:
            'https://rock.prezly.com/settings/newsrooms/578e78e9-9a5b-44ad-bda2-5214895ee036/languages',
        look_and_feel_settings:
            'https://rock.prezly.com/settings/newsrooms/578e78e9-9a5b-44ad-bda2-5214895ee036/themes',
        manual_subscription_management: '',
        privacy_settings:
            'https://rock.prezly.com/settings/newsrooms/578e78e9-9a5b-44ad-bda2-5214895ee036/privacy',
        widget_settings: 'https://rock.prezly.com/pressroom/the-good-news-room/widget',
    },
    time_format: 'HH:mm',
    date_format: 'D/M/YY',
    domain: 'the-good-news-room.prezly.com',
    is_hub: false,
    cultures: [
        {
            code: 'en',
            locale: 'en',
            name: 'English (Global)',
            native_name: 'English (Global)',
            direction: TextDirection.LTR,
            language_code: 'en',
        },
        {
            code: 'es_ES',
            locale: 'es_ES',
            name: 'Spanish (Spain)',
            native_name: 'Español (España)',
            direction: TextDirection.LTR,
            language_code: 'es',
        },
        {
            code: 'fr',
            locale: 'fr',
            name: 'French (Global)',
            native_name: 'Français (Mondial)',
            direction: TextDirection.LTR,
            language_code: 'fr',
        },
        {
            code: 'nl_BE',
            locale: 'nl_BE',
            name: 'Dutch (Belgium)',
            native_name: 'Nederlands (België)',
            direction: TextDirection.LTR,
            language_code: 'nl',
        },
    ],
    campaigns_number: 0,
    stories_number: 26,
    public_galleries_number: 3,
    square_logo: {
        version: 2,
        uuid: 'e642ecf6-7a5b-4bc0-943f-110af0b196c9',
        filename: 'Group 27.png',
        mime_type: 'image/png',
        size: 6635,
        original_width: 326,
        original_height: 326,
        effects: [],
    },
    newsroom_logo: {
        version: 2,
        uuid: 'c7ca1fd0-1978-4388-a5b7-4520fd949b89',
        filename: 'TGNR-logo1.png',
        mime_type: 'image/png',
        size: 22037,
        original_width: 925,
        original_height: 332,
        effects: [],
    },
    icon: {
        version: 2,
        uuid: '848ea31f-c575-4b8b-a369-1bf8b0f3a1c7',
        filename: 'TGNR-favi1.png',
        mime_type: 'image/png',
        size: 6635,
        original_width: 326,
        original_height: 326,
        effects: [],
    },
    email_branding_mode: EmailBrandingMode.CUSTOM,
    email_branding: {
        background_color: '#fafafa',
        title_color: '#5748ff',
        text_color: '#1427d9',
        link_color: '#8b83ed',
    },
    is_privacy_portal_enabled: true,
    custom_privacy_policy_link: null,
    custom_data_request_link: null,
    tracking_policy: TrackingPolicy.DEFAULT,
    cookiepro: {
        is_enabled: false,
        category: null,
    },
    ga_tracking_id: null,
    segment_analytics_id: '',
    is_subscription_form_enabled: true,
    is_white_labeled: false,
    status: NewsroomStatus.ACTIVE,
};
