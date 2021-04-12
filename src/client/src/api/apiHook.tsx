import React from 'react';
import {useSelector} from "react-redux";
import {selectSettings} from "../features/settings/settingsSlice";
import {RequestMethod} from "./index";

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
            throw new Error(response.status.toString());
        }

        const result = await response.json();
        return result as Promise<T>;
    }

    return [makeRequest];
}