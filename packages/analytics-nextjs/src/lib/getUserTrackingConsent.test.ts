import { TrackingPolicy } from '../types';
import { DEFAULT_NEWSROOM } from '../__mocks__/newsroom';

import { isTrackingCookieAllowed } from './isTrackingCookieAllowed';
import * as isNavigatorTrackingAllowedModule from './isNavigatorTrackingAllowed';

let trackingSpy: jest.SpyInstance<boolean | null>;
beforeEach(() => {
    trackingSpy = jest.spyOn(isNavigatorTrackingAllowedModule, 'isNavigatorTrackingAllowed');
});

it('should return `false` when Newsroom tracking is disabled', () => {
    expect(
        isTrackingCookieAllowed(null, {
            ...DEFAULT_NEWSROOM,
            tracking_policy: TrackingPolicy.DISABLED,
        }),
    ).toBe(false);
});

it('should return a value when Newsroom is not provided', () => {
    expect(isTrackingCookieAllowed(null)).toBe(null);
});

it("should return the consent value when it's not null", () => {
    expect(isTrackingCookieAllowed(true, DEFAULT_NEWSROOM)).toBe(true);

    expect(isTrackingCookieAllowed(false, DEFAULT_NEWSROOM)).toBe(false);
});

it('should return `false` when navigator tracking is not allowed', () => {
    trackingSpy.mockReturnValue(false);

    expect(isTrackingCookieAllowed(null, DEFAULT_NEWSROOM)).toBe(false);
});

it('should return `null` when navigator tracking has no preference', () => {
    trackingSpy.mockReturnValue(true);

    expect(isTrackingCookieAllowed(null, DEFAULT_NEWSROOM)).toBe(null);
});
