import React from 'react';
import {useSelector} from "react-redux";
import {selectSettings} from "../features/settings/settingsSlice";
import {RequestMethod} from "./index";
import {InvalidApiResponse} from "../../../server/types/api.interface";
import {ApiError} from "./apiError";

export const useApiHook = () => {
    const settings = useSelector(selectSettings);

    async function makeRequest<T>(url: string, requestMethod: RequestMethod, body?: Record<string, unknown>) {
        const headers: Record<string, string> = {};

        if (body) {
            headers['Content-Type'] = 'application/json';
            headers['Access-Control-Allow-Origin'] = '*';
        }

        const response = await fetch(`${settings.baseUrl}:${settings.port}/${url}`, {
            method: requestMethod,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const error = JSON.parse(await response.text()) as InvalidApiResponse;
            throw new ApiError(response.status, response.statusText, error.errors);
        }

        const result = await response.json();
        return result as Promise<T>;
    }

    return [makeRequest];
}