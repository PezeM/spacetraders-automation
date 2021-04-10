import React from 'react';
import useSWR from "swr";
import {Loader} from "../components/loader";
import {Result} from "antd";
import {ShopShip} from "spacetraders-api-sdk";

export const ShipsShop = () => {
    const {data, error} = useSWR<ShopShip[]>('ship-shop/');

    if (!data) return <Loader size={36} loadingTip={"Getting ships..."}/>;
    if (error) return <Result status="error" title="Couldn't fetch ships"/>;

    return (
        <div>
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}