import React from 'react';
import useSWR from "swr";
import {Loader} from "../components/loader";
import {Result} from "antd";
import {Location} from "spacetraders-api-sdk";
import {LocationsTable} from "../components/locationsTable";

export const LocationsView = () => {
    const {data, error} = useSWR<Location[]>('location/all');

    if (!data) return <Loader size={36} loadingTip={"Getting locations..."}/>;
    if (error) return <Result status="error" title="Couldn't fetch locations"/>;

    return (
        <div>
            <LocationsTable locations={data} />
        </div>
    )
}