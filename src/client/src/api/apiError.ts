export class ApiError extends Error {
    constructor(public readonly status: number, public readonly statusText: string, public readonly errors: string[]) {
        super();
    }
}