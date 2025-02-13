function loadTagManager(analyticsId: `GTM-${string}`) {
    const script = document.createElement('script');
    script.setAttribute('id', 'google-tag-manager-bootstrap');
    script.innerHTML = `\
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${analyticsId}');`;

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
            <iframe
                src="https://www.googletagmanager.com/ns.html?id=${analyticsId}"
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
            />
        `;

    document.head.appendChild(script);
    document.body.appendChild(noscript);
}

function loadAnalytics(analyticsId: string) {
    const gtagScript = document.createElement('script');
    gtagScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`);

    const script = document.createElement('script');
    script.setAttribute('id', 'google-tag-manager-bootstrap');
    script.innerHTML = `\
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${analyticsId}');`;

    document.head.appendChild(gtagScript);
    document.head.appendChild(script);
}

export function loadGoogleAnalytics(analyticsId: string) {
    const isLoaded = Boolean(document.getElementById('google-tag-manager-bootstrap'));

    if (isLoaded) {
        return;
    }

    if (analyticsId.startsWith('GTM-')) {
        loadTagManager(analyticsId as `GTM-${string}`);
    } else {
        loadAnalytics(analyticsId);
    }
}
