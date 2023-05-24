# Prezly Analytics for Next.js

![Version](https://img.shields.io/npm/v/@prezly/analytics-nextjs)
![License](https://img.shields.io/npm/l/@prezly/analytics-nextjs)
[![codecov](https://codecov.io/gh/prezly/analytics/branch/main/graph/badge.svg?token=C6E6D5588L)](https://codecov.io/gh/prezly/analytics)

This library is an easy plug-and-play solution to enable Prezly Analytics on your website or application built with [Next.js]. It is based on [analytics-next] by Segment, and is basically a wrapper around the library, which allows you to use both Segment analytics and Prezly analytics with little to no boilerplate. The API for tracking calls remains unchanged from [analytics-next], so you can refer to its documentation for any additional Segment features you want to use in your project.

# Features

- 🔁 Seamless integration with Segment Analytics
- 🤖 Automatically handles Segment and Google Analytics integrations on your Prezly Newsroom
- 🔒 GDPR-compliant tracking
- 🍪 Ready-made components to handle Cookie Consent
- 🧪 Experimental: [Plausible] integration
- 🚀 Coming soon: 1st party domain tracking support

# Adding the library to your Next.js application

## npm

```Shell
npm install --save @prezly/analytics-nextjs
```

## peerDependencies

This library is intended to be used with [Next.js] applications, so it requires `next`, `react` and `react-dom` to work. These should already be installed if you have an existing [Next.js] app.
If you're starting from scratch, use [create-next-app] to quick-start the project.

To keep things fresh, we require at least Next.js 12 and React 17.

You can also install the dependencies manually
```Shell
npm install --save next react react-dom
npm install --save-dev @types/react @types/react-dom
```

## Install into your Next.js application

### /pages/_app.tsx

In order for the library to work, you need to install it's context provider close to the top of your component tree. Ideal place for that would be the custom `_app` component.

The context provider requires the `newsroom` prop to connect to Prezly Analytics. `currentStory` prop is optional and should only be set when user is navigating a page related to a particular Prezly Story.

```tsx
import { AnalyticsContextProvider } from '@prezly/analytics-nextjs';
import type { AppProps } from 'next/app';

function App({ Component, pageProps }: AppProps) {
    /* Code that extracts the `newsroom` and `currentStory` props */

    return (
        <AnalyticsContextProvider
            newsroom={newsroom}
            story={currentStory}
        >
            <Component {...pageProps} />
        </AnalyticsContextProvider>
    );
}

export default App;
```

To keep the example simple, we omit the code that actually fetches these props, since that can depend on your particular implementation. You can check how it's implemented in [Prezly Bea Theme](https://github.com/prezly/theme-nextjs-bea/blob/f6f04515314bd2297cd7b1303f33bd24c564e182/pages/_app.tsx#L15) utilising our [Next.js Theme Kit](https://github.com/prezly/theme-kit-nextjs).

You can also disable Analytics for some places of your app by setting `isEnabled` prop to `false`. This might be useful if you only want to use Prezly Analytics on specific pages of your website.

This component exposes the `AnalyticsContext` which can be consumed with `useAnalytics` hook exported from the library. Note that it doesn't do any tracking calls on its own, only providing the methods to do so. See later sections for more details.

### Enabling automatic page tracking

With only context provider, you won't get any automatic tracking calls. To enable the base tracking for page visits and campaign asset clicks, you should place `<Analytics />` component anywhere in your component tree that is below the `AnalyticsContextProvider`. The best place to do it is in a custom `Layout` component.

```tsx
import { Analytics } from '@prezly/analytics-nextjs';
import type { PropsWithChildren } from 'react';

interface Props {}

function Layout({ children }: PropsWithChildren<Props>) {

    return (
        <>
            <Analytics />
            <main className="customLayout">
                {children}
            </main>
        </>
    );
}
export default Layout;
```

Here's what this component does for you:
- Automatic page visit tracking
- Detecting Campaign recipients and firing `Campaign Click` events
- Auto-clicking assets linked from a Campaign when used with [Prezly Content React Renderer]
- Inserting Google Analytics snippet, if the integration is enabled for your newsroom

### Tracking additional events

The library exposes `useAnalytics` hook, which returns all the usual methods to send analytics events, as well as the original `analytics` instance, which you can use if you need any custom behavior.

Tracking events to Prezly is pretty simple: you need to import the desired event group (`STORY_LINK` in this example), and pass it to the `track()` call.

```tsx
import { STORY_LINK, useAnalytics } from '@prezly/analytics-nextjs';
import type { PropsWithChildren } from 'react';

import styles from './styles.module.scss';

interface Props {
    href: string;
}

export function Link({ href, children }: PropsWithChildren<Props>) {
    const { track } = useAnalytics();

    function handleClick() {
        track(STORY_LINK.CLICK, { href });
    }

    return (
        <a href={href} onClick={handleClick}>
            {children}
        </a>
    );
}
```

You can find more examples of tracking calls in the [Prezly Bea Theme] repo.

### Using Segment tracking without Prezly Tracking

If you want to use a single solution to also track pages unrelated to Prezly, you can omit `newsroom` and `story` props on pages that don't need it. 
Instead, you would pass `segmentWriteKey` prop to `AnalyticsContextProvider`. This will disable sending events to PrezlyAnalytics and will only send events to Segment.
Note that you need to pass either `segmentWriteKey` or `newsroom` to make the tracking library work.

# What's next

You can learn more on how this library can be used by checking the code of [Prezly Bea Theme].

Please refer to [analytics-next] and [Segment docs](https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/) to learn more about capabilities of the underlying library.

[analytics-next]: https://github.com/segmentio/analytics-next
[Next.js]: https://nextjs.org
[Prezly Bea Theme]: https://github.com/prezly/theme-nextjs-bea
[Prezly Content React Renderer]: https://www.npmjs.com/package/@prezly/content-renderer-react-js
[Plausible]: https://plausible.io