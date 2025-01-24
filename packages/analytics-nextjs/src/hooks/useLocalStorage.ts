import { useCallback, useState } from 'react';

import { noop } from '../lib';

export function useLocalStorage<T>(key: string) {
    if (typeof window === 'undefined') {
        return { value: undefined, set: noop, remove: noop };
    }

    if (!key) {
        throw new Error('useLocalStorage key may not be falsy');
    }

    /* eslint-disable react-hooks/rules-of-hooks */

    const [storedData, setStoredData] = useState<T | undefined>(() => {
        const storedValue = localStorage.getItem(key);

        if (storedValue) {
            try {
                return JSON.parse(storedValue);
            } catch (error) {
                return storedValue;
            }
        }
        return undefined;
    });

    const set = useCallback(
        (value: T) => {
            localStorage.setItem(key, JSON.stringify(value));
            setStoredData(value);
        },
        [key],
    );

    const remove = useCallback(() => {
        localStorage.removeItem(key);
        setStoredData(undefined);
    }, [key]);

    /* eslint-enable react-hooks/rules-of-hooks */

    return {
        value: storedData,
        set,
        remove,
    };
}
