import Script from 'next/script';

export function GoogleAnalytics(props: { analyticsId: string }) {
    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${props.analyticsId}`} />
            <Script
                id="google-tag-manager-bootstrap"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${props.analyticsId}');
                        `,
                }}
            />
        </>
    );
}
