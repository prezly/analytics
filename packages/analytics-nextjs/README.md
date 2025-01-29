# Prezly Analytics for Next.js

![Version](https://img.shields.io/npm/v/@prezly/analytics-nextjs)
![License](https://img.shields.io/npm/l/@prezly/analytics-nextjs)
[![codecov](https://codecov.io/gh/prezly/analytics/branch/main/graph/badge.svg?token=C6E6D5588L)](https://codecov.io/gh/prezly/analytics)

This library is an easy plug-and-play solution to enable Prezly Analytics on your website or application. It is based on [analytics-next] by Segment, and is basically a wrapper around the library, which allows you to use both Segment analytics and Prezly analytics with little to no boilerplate. The API for tracking calls remains unchanged from [analytics-next], so you can refer to its documentation for any additional Segment features you want to use in your project.

# Features

- 🔁 Seamless integration with Segment Analytics
- 🤖 Automatically handles Segment and Google Analytics integrations on your Prezly Newsroom
- 🔒 GDPR-compliant tracking
- 🚀 Coming soon: 1st party domain tracking support

# Adding the library to your application

## npm

```Shell
npm install --save @prezly/analytics-nextjs
```

## Install into your Next.js application

### /pages/\_app.tsx

First you need to create a global analytics instance:

```ts
import { Analytics } from '@prezly/analytics-nextjs';

export const analytics = new Analytics();
```

Next you need to initialize analytics. In Prezly websites we do it in `useEffect`, when we have all the required settings loaded.

```tsx
analytics.init({
    consent,
    trackingPolicy,
    segment: {
        settings: {
            writeKey: segmentWriteKey,
        },
    },
    plausible: {
        domain: 'plausible domain',
    },
    google: { analyticsId: googleAnalyticsId },
});
```

If you want to disable Segment, Plausible or Google tracking, just set their settings to `false`.

To keep the example simple, we omit the code that actually fetches these props, since that can depend on your particular implementation. You can check how it's implemented in [Prezly Bea Theme](https://github.com/prezly/theme-nextjs-bea/blob/f6f04515314bd2297cd7b1303f33bd24c564e182/pages/_app.tsx#L15) utilising our [Next.js Theme Kit](https://github.com/prezly/theme-kit-nextjs).


### Enabling automatic page tracking

In order to enable the base tracking for page visits and campaign asset clicks, you should place `Tracking` component anywhere in your component tree. The best place to do it is in a custom `Layout` component.

```tsx
import { Tracking } from '@prezly/analytics-nextjs';
import type { PropsWithChildren } from 'react';

import { analytics } from '@/lib/analytics';

interface Props {}

function Layout({ children }: PropsWithChildren<Props>) {
    return (
        <>
            <Tracking analytics={analytics} />
            <main className="customLayout">{children}</main>
        </>
    );
}
export default Layout;
```

Here's what this component does for you:

- Automatic page visit tracking
- Detecting Campaign recipients and firing `Campaign Click` events
- Auto-clicking assets linked from a Campaign when used with [Prezly Content React Renderer]

### Tracking additional events

Tracking events to Prezly is pretty simple: you need to import the desired event group (`STORY_LINK` in this example), and pass it to the `track()` call.

```tsx
import { STORY_LINK, useAnalytics } from '@prezly/analytics-nextjs';
import type { PropsWithChildren } from 'react';

import { analytics } from '@/lib/analytics';

import styles from './styles.module.scss';

interface Props {
    href: string;
}

export function Link({ href, children }: PropsWithChildren<Props>) {
    function handleClick() {
        analytics.track(STORY_LINK.CLICK, { href });
    }

    return (
        <a href={href} onClick={handleClick}>
            {children}
        </a>
    );
}
```

Tracking to Prezly is done through Segment plugin. This is done for getting event object enriched by Segment.
Prezly analytics require `newsroom` property to be set in `meta` object.

```tsx
analytics.setMeta({ newsroom: 'newsroom uuid' });
```

You can find more examples of tracking calls in the [Prezly Bea Theme] repo.

### Cookie consent

You can now pass user cookie consent as a `consent` prop to `AnalyticsProvider`. Consent may include following categories:

- `first-party-analytics` - Allows Prezly and Plausible tracking
- `third-party-cookies` - Is a superset of `first-party-analytics` and also allows Google Analytics

# What's next

You can learn more on how this library can be used by checking the code of [Prezly Bea Theme].

Please refer to [analytics-next] and [Segment docs](https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/) to learn more about capabilities of the underlying library.

[analytics-next]: https://github.com/segmentio/analytics-next
[Prezly Bea Theme]: https://github.com/prezly/theme-nextjs-bea
[Prezly Content React Renderer]: https://www.npmjs.com/package/@prezly/content-renderer-react-js
