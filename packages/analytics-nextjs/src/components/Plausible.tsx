import PlausibleProvider from 'next-plausible';

interface Props {
    domain: string;
}

export function Plausible({ domain }: Props) {
    return (
        <PlausibleProvider
            domain={domain}
            scriptProps={{
                src: 'https://atlas.prezly.com/js/script.outbound-links.js',
                // This is a documented parameter, but it's not reflected in the types
                // See https://github.com/4lejandrito/next-plausible/blob/master/test/page/pages/scriptProps.js
                // @ts-expect-error
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'data-api': 'https://atlas.prezly.com/api/event',
            }}
        >
            {/* 
                This is the only way I found to test if the PlausibleProvider is rendered. 
                It doesn't render any markup by itself, and the `usePlausible` hook looks the same whether provider is present or not 
            */}
            {/* TODO: Check if window.plausible would be enough */}
            {process.env.NODE_ENV === 'test' && <div data-testid="plausible-debug-enabled" />}
        </PlausibleProvider>
    );
}
