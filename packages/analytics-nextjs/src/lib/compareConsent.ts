import type { Consent } from '../types';

export function checkIsConsentEqual(consent1: Consent | undefined, consent2: Consent | undefined) {
    if (consent1 === consent2) {
        return true;
    }

    if (typeof consent1 === 'undefined' || typeof consent2 === 'undefined') {
        return false;
    }

    const containsSameCategories =
        consent1.categories.length === consent2.categories.length &&
        new Set([...consent1.categories, ...consent2.categories]).size ===
            consent1.categories.length;

    return containsSameCategories;
}
