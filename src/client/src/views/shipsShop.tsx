import React, {useEffect, useState} from 'react';
import useSWR from "swr";
import {Loader} from "../components/loader";
import {Result} from "antd";
import {ShopShip} from "spacetraders-api-sdk";
import {groupBy} from "../helpers/arrays";
import {ShipyardContainer} from '../components/ships/shipyard/shipyardContainer';

export const ShipsShop = () => {
    const {data, error} = useSWR<ShopShip[]>('ship-shop/');
    const [groupedData, setGroupedData] = useState<Map<string, ShopShip[]>>();

    useEffect(() => {
        if (data) {
            setGroupedData(groupBy(data, "manufacturer"));
        }
    }, [data]);

    if (!data || !groupedData) return <Loader size={36} loadingTip={"Getting ships..."}/>;
    if (error) return <Result status="error" title="Couldn't fetch ships"/>;

    return (
        <div>
            <ShipyardContainer data={groupedData}/>
        </div>
    )
}