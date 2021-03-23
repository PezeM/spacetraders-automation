import React from 'react';
import './App.css';
import useSWR, {SWRConfig} from 'swr';

const baseUrl = 'http://localhost:8081'

const fetcher = (url: string, ...args: any[]) => fetch(`${baseUrl}/${url}`, ...args).then(res => res.json());

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
            fetcher,
            revalidateOnFocus: true
        }}>
            <div className="App">
                <TestUser/>
            </div>
        </SWRConfig>
    );
}

export default App;
