type GoogleAnalyticsId = string;

interface Window {
    [key: `ga-disable-${string}`]: boolean | undefined;
}
