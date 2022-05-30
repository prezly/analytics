/**
 * @jest-environment node
 */

import { isNavigatorTrackingAllowed } from './isNavigatorTrackingAllowed';

it('should return `null` in SSR environment', () => {
    expect(isNavigatorTrackingAllowed()).toBe(null);
});
