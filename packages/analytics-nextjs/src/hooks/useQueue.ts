/**
 * This code is based on https://github.com/jonstuebe/use-queue with async parts removed
 * TODO: Replace this with `@react-hookz/web` implementation, when it's shipped
 */
import { useCallback, useReducer } from 'react';

export interface QueueMethods<T> {
    add: (item: T) => void;
    remove: () => void;
    first: T;
    last: T;
    size: number;
}

export type ReducerStateType<T> = {
    queue: T[];
};

export type ReducerActionType<T> = {
    type: 'ADD' | 'REMOVE';
    payload?: T;
};

function reducer<T>(state: T[], action: ReducerActionType<T>) {
    switch (action.type) {
        case 'ADD': {
            if (!action.payload) {
                return state;
            }

            return [...state, action.payload];
        }
        case 'REMOVE':
            return state.slice(1);
        default:
            return state;
    }
}

export function useQueue<T = any>(initialState: T[] = []): QueueMethods<T> {
    const [queue, dispatch] = useReducer(reducer, initialState);

    const add = useCallback((payload: T) => {
        dispatch({
            type: 'ADD',
            payload,
        });
    }, []);

    const remove = useCallback(() => {
        dispatch({
            type: 'REMOVE',
        });
    }, []);

    return {
        add,
        remove,
        get first() {
            return queue[0] as T;
        },
        get last() {
            return queue[queue.length - 1] as T;
        },
        get size() {
            return queue.length;
        },
    };
}
