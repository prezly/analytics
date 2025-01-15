import { useCallback, useState } from 'react';

export interface QueueMethods<T> {
    add: (item: T) => void;
    remove: () => void;
    first: T;
    last: T;
    size: number;
}

export function useQueue<T = any>(initialState: T[] = []): QueueMethods<T> {
    const [queue, setQueue] = useState(initialState);

    const add = useCallback((value: T) => {
        setQueue((q) => [...q, value]);
    }, []);

    const remove = useCallback(() => {
        setQueue((q) => q.slice(1));
    }, []);

    return {
        add,
        remove,
        get first() {
            return queue[0];
        },
        get last() {
            return queue[queue.length - 1];
        },
        get size() {
            return queue.length;
        },
    };
}
