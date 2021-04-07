export const fetcher = (baseUrl: string, port: number | string, url: string, ...args: any[]) =>
    fetch(`${baseUrl}:${port}/${url}`, ...args).then(res => res.json());