import { isNavigatorTrackingAllowed } from './isNavigatorTrackingAllowed';

describe('isNavigatorTrackingAllowed', () => {
    // TODO: Find a proper way to mock navigator settings
    // it('should return `false` when Cookies are disabled', () => {
    //     const cookieSpy = jest.spyOn(window.navigator, 'cookieEnabled', 'get');
    //     cookieSpy.mockReturnValueOnce(false);

    //     expect(cookieSpy).toHaveBeenCalled();
    //     expect(isNavigatorTrackingAllowed()).toBe(false);
    // });

    it('should return `null` with no preference', () => {
        expect(isNavigatorTrackingAllowed()).toBe(null);
    });
});
