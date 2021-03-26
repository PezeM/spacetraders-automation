import React from 'react';
import './App.css';
import useSWR, {SWRConfig} from 'swr';
import {BASE_PORT, BASE_URL} from "./constants/server";

const fetcher = (port: number | string, url: string, ...args: any[]) =>
    fetch(`${BASE_URL}:${port}/${url}`, ...args).then(res => res.json());

const TestUser = () => {
    const {data, error, mutate} = useSWR('user/', {refreshInterval: 1000});

    if (!data) {
        return <div>Loading data...</div>;
    }

    if (error) return <div onClick={() => mutate()}>Error</div>;

    return (
        <div>
            Test data
            <pre>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
    )
}

function App() {
    return (
        <SWRConfig value={{
            fetcher: (url, ...args: any[]) => fetcher(BASE_PORT, url, ...args),
            revalidateOnFocus: true
        }}>
            <div className="App">
                <TestUser/>
            </div>
        </SWRConfig>
    );
}

export default App;
