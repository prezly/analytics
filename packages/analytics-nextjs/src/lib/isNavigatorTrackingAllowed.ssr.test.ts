/**
 * @jest-environment node
 */

import { isNavigatorTrackingAllowed } from './isNavigatorTrackingAllowed';

describe('isNavigatorTrackingAllowed (SSR)', () => {
    it('should return `null` in SSR environment', () => {
        expect(isNavigatorTrackingAllowed()).toBe(null);
    });
});
