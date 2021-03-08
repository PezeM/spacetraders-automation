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
 */
export const waitFor = (func: () => boolean, timeout?: number) => {
    return new Promise((resolve, reject) => {
        try {
            let timeoutTimer: Timeout | undefined;

            const clearTimers = () => {
                clearInterval(interval);
                if (timeoutTimer) clearTimeout(timeoutTimer);
            };

            let interval = setInterval(() => {
                if (func()) {
                    clearTimers();
                    resolve(true);
                    return;
                }
            }, 10);

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