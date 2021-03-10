/**
 * Waits for certain amount of milliseconds
 * @param time Number of milliseconds to wait
 */
import Timeout = NodeJS.Timeout;

export const wait = (time: number) => new Promise(r => setTimeout(r, time));

/**
 * Waits for function to complete and return true
 * @param func
 * @param timeout
 * @param interval
 */
export const waitFor = (func: () => boolean, timeout?: number, interval: number = 50) => {
    return new Promise((resolve, reject) => {
        try {
            let timeoutTimer: Timeout | undefined;

            const clearTimers = () => {
                clearInterval(intervalId);
                if (timeoutTimer) clearTimeout(timeoutTimer);
            };

            let intervalId = setInterval(() => {
                if (func()) {
                    clearTimers();
                    resolve(true);
                    return;
                }
            }, interval);

            if (timeout) {
                timeoutTimer = setTimeout(() => {
                    clearTimers();
                    reject('Function timed out');
                    return;
                }, timeout);
            }
        } catch (e) {
            console.error(`Wait for timeout. ${func.toString()}`)
        }
    });
}