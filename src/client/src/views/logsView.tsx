import React from 'react';
import useSWR from "swr";
import {Loader} from "../components/loader";
import {Result} from "antd";
import {Location} from "spacetraders-api-sdk";

export const LogsView = () => {
    const {data, error} = useSWR<Location[]>('logs/');

    if (!data) return <Loader size={36} loadingTip={"Getting logs..."}/>;
    if (error) return <Result status="error" title="Couldn't fetch logs"/>;

    return (
        <div>
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}