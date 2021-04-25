export const getUniqueValuesFromArray = <K, T extends keyof K>(data: K[], property: T) => {
    return [...new Set(data.map(s => s[property]).flat())];
}

/**
 * Groups all items in an array of objects `T` where the value of property `K` is the same
 * @param array Items to group
 * @param key Key of `T` to group by
 */
export const groupBy = <T, K extends keyof T>(array: T[], key: K) => {
    const map = new Map<T[K], T[]>();

    for (const item of array) {
        const itemKey = item[key];

        if (!map.has(itemKey)) {
            map.set(itemKey, array.filter(i => i[key] === item[key]));
        }
    }

    return map;
}

export const getSortedData = <T, K extends keyof T>(array: T[], prop: K, ascending = true): T[] => {
    return array.sort((a, b) => (a[prop] < b[prop] ? -1 : 1) * (ascending ? 1 : -1));
}