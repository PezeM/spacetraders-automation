export const getUniqueValuesFromArray = <K, T extends keyof K>(data: K[], property: T) => {
    return [...new Set(data.map(s => s[property]).flat())];
}