import { useState } from 'react';

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

    function set(value: T) {
        localStorage.setItem(key, JSON.stringify(value));
        setStoredData(value);
    }

    function remove() {
        localStorage.removeItem(key);
        setStoredData(undefined);
    }

    return {
        value: storedData,
        set,
        remove,
    };
}
