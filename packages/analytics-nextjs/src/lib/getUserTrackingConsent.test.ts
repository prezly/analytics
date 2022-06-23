import { TrackingPolicy } from '../types';
import { DEFAULT_NEWSROOM } from '../__mocks__/newsroom';

import { getUserTrackingConsent } from './getUserTrackingConsent';
import * as isNavigatorTrackingAllowedModule from './isNavigatorTrackingAllowed';

let trackingSpy: jest.SpyInstance<boolean | null>;
beforeEach(() => {
    trackingSpy = jest.spyOn(isNavigatorTrackingAllowedModule, 'isNavigatorTrackingAllowed');
});

it('should return `false` when Newsroom tracking is disabled', () => {
    expect(
        getUserTrackingConsent(null, {
            ...DEFAULT_NEWSROOM,
            tracking_policy: TrackingPolicy.DISABLED,
        }),
    ).toBe(false);
});

it("should return the consent value when it's not null", () => {
    expect(getUserTrackingConsent(true, DEFAULT_NEWSROOM)).toBe(true);

    expect(getUserTrackingConsent(false, DEFAULT_NEWSROOM)).toBe(false);
});

it('should return `false` when navigator tracking is not allowed', () => {
    trackingSpy.mockReturnValue(false);

    expect(getUserTrackingConsent(null, DEFAULT_NEWSROOM)).toBe(false);
});

it('should return `null` when navigator tracking has no preference', () => {
    trackingSpy.mockReturnValue(true);

    expect(getUserTrackingConsent(null, DEFAULT_NEWSROOM)).toBe(null);
});
