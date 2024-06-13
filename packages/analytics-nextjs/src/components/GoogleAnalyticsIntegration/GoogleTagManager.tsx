import Script from 'next/script';

export function GoogleTagManager(props: { analyticsId: `GTM-${string}` }) {
    return (
        <>
            <Script
                id="google-tag-manager-bootstrap"
                dangerouslySetInnerHTML={{
                    __html: `
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${props.analyticsId}');
                        `,
                }}
            />
            <noscript>
                {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${props.analyticsId}`}
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                />
            </noscript>
        </>
    );
}
