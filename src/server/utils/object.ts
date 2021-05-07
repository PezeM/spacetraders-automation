/**
 * Removes all symbol from object
 * @param data Data object with symbols
 */
export const omitSymbols = (data: Record<any, any>) => {
    const result: Record<any, any> = {};
    for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
            result[prop] = data[prop];
        }
    }

    return result;
}

/**
 * Returns symbol name from object
 * @param data Data with symbol
 * @param symbol Symbol identificator
 */
export const getSymbolFromObject = (data: any, symbol: string) => {
    return Reflect.ownKeys(data).find(s => {
        if (String(s) === symbol) return s;
    });
}