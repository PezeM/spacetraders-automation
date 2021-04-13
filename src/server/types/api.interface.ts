export interface ValidApiResponse<T>{
    valid: true;
    data: T;
}

export interface InvalidApiResponse {
    valid: false;
    errors: string[];
}

export type ApiResponse<T> = ValidApiResponse<T> | InvalidApiResponse;