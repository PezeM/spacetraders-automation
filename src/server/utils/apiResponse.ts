import {InvalidApiResponse, ValidApiResponse} from "../types/api.interface";

export const createApiResponse = <T>(data: T): ValidApiResponse<T> => {
    return {
        valid: true,
        data
    }
}

export const createApiErrorResponse = (errors: string[] | string): InvalidApiResponse => {
    return {
        valid: false,
        errors: typeof errors === 'string' ? [errors] : errors
    }
}

export const apiAddError = (apiResponse: InvalidApiResponse, error: string): InvalidApiResponse => {
    return {
        valid: false,
        errors: [...apiResponse.errors, error]
    }
}