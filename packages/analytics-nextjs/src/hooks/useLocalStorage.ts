import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string) {
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

    return {
        value: storedData,
        set,
        remove,
    };
}
