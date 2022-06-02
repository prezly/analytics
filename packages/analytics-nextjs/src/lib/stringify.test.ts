import { stringify } from './stringify';

it('returns empty string with no arguments', () => {
    expect(stringify()).toBe('');
});

it('returns stringified version of a single argument', () => {
    expect(stringify(false)).toBe('false');
    expect(stringify({ a: 'test', b: 123 })).toBe('{"a":"test","b":123}');
});

it('returns stringified version of a multiple argument', () => {
    expect(stringify(false, true)).toBe('false, true');
    expect(stringify({ a: 'test', b: 123 }, [1, 2, 3])).toBe('{"a":"test","b":123}, [1,2,3]');
});
