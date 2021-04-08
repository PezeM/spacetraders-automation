import React from 'react';
import useSWR from "swr";
import {Ship} from "../../../server/models/ship";
import {Result} from "antd";
import {Loader} from "../components/loader";
import {OwnShipTable} from "../components/ships/ownShips/table";

export const OwnShips = () => {
    const {data, error} = useSWR<Ship[]>('ship/');

    if (!data) return <Loader size={36}/>;
    if (error) return <Result status="error" title="Couldn't fetch ships"/>;

    return (
        <div>
            <OwnShipTable ships={data}/>
        </div>
    )
}