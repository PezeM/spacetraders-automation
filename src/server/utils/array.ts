export const getSortedData = <T, K extends keyof T>(array: T[], prop: K, ascending = true): T[] => {
    return array.sort((a, b) => (a[prop] < b[prop] ? -1 : 1) * (ascending ? 1 : -1));
}