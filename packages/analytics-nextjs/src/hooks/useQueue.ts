/**
 * This code is ported from https://github.com/streamich/react-use/blob/master/src/useQueue.ts
 * with minor modifications to align with the project code-style
 * TODO: Replace this with `@react-hookz/web` implementation, when it's shipped
 */
import { useState } from 'react';

export interface QueueMethods<T> {
    add: (item: T) => void;
    remove: () => void;
    first: T;
    last: T;
    size: number;
}

export function useQueue<T>(initialValue: T[] = []): QueueMethods<T> {
    const [state, set] = useState(initialValue);
    return {
        add: (value) => {
            set((queue) => [...queue, value]);
        },
        // This is changed from original implementation, to resolve TS complaints.
        remove: () => {
            set((queue) => queue.slice(1));
        },
        get first() {
            return state[0];
        },
        get last() {
            return state[state.length - 1];
        },
        get size() {
            return state.length;
        },
    };
}
