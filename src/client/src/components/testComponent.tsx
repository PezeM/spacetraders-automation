import useSWR from "swr";
import React from "react";

export const TestComponent = () => {
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