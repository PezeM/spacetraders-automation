/**
 * Waits for certain amount of milliseconds
 * @param time Number of milliseconds to wait
 */
export const wait = (time: number) => new Promise(r => setTimeout(r, time));