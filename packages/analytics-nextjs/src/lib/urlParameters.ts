type ParameterPrefix = 'asset_' | 'utm_';

export function getUrlParameters(prefix: ParameterPrefix): Map<string, string> {
    const searchParams = new URLSearchParams(window.location.search);
    const map = new Map();

    searchParams.forEach((value, name) => {
        if (value && value !== 'undefined' && name.startsWith(prefix)) {
            map.set(name.replace(prefix, ''), value);
        }
    });

    return map;
}
