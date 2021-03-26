import {BASE_URL} from "../constants/server";

export const fetcher = (port: number | string, url: string, ...args: any[]) =>
    fetch(`${BASE_URL}:${port}/${url}`, ...args).then(res => res.json());