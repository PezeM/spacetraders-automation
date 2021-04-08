import React from 'react';
import useSWR from "swr";
import {Ship} from "../../../server/models/ship";
import {Loader} from "../components/loader";
import {Result} from "antd";

export const OwnShips = () => {
    const {data, error} = useSWR<Ship[]>('ship/');

    if (!data) return <Loader size={36}/>;
    if (error) return <Result status="error" title="Couldn't fetch ships"/>;

    return (
        <div>Test
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}