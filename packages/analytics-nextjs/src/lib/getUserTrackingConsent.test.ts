import type { Newsroom } from '@prezly/sdk';

import { TrackingPolicy } from '../types';

import { getUserTrackingConsent } from './getUserTrackingConsent';
import * as isNavigatorTrackingAllowedModule from './isNavigatorTrackingAllowed';

describe('getUserTrackingConsent', () => {
    let trackingSpy: jest.SpyInstance<boolean | null>;
    beforeEach(() => {
        trackingSpy = jest.spyOn(isNavigatorTrackingAllowedModule, 'isNavigatorTrackingAllowed');
    });

    it('should return `false` when Newsroom tracking is disabled', () => {
        expect(
            getUserTrackingConsent(null, {
                tracking_policy: TrackingPolicy.DISABLED,
            } as Newsroom),
        ).toBe(false);
    });

    it("should return the consent value when it's not null", () => {
        expect(
            getUserTrackingConsent(true, {
                tracking_policy: TrackingPolicy.DEFAULT,
            } as Newsroom),
        ).toBe(true);

        expect(
            getUserTrackingConsent(false, {
                tracking_policy: TrackingPolicy.DEFAULT,
            } as Newsroom),
        ).toBe(false);
    });

    it('should return `false` when navigator tracking is not allowed', () => {
        trackingSpy.mockReturnValue(false);

        expect(getUserTrackingConsent(null, {} as Newsroom)).toBe(false);
    });

    it('should return `null` when navigator tracking has no preference', () => {
        trackingSpy.mockReturnValue(true);

        expect(getUserTrackingConsent(null, {} as Newsroom)).toBe(null);
    });
});
