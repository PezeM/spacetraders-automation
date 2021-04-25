import {ShopShip} from "spacetraders-api-sdk";
import React from "react";
import {Card, Col, Row} from "antd";
import {ShipyardCard} from "./shipyardCard";

interface Props {
    data: Map<string, ShopShip[]>;
}

export const ShipyardContainer: React.FC<Props> = ({data}) => {
    function renderCards() {
        const cards = [];

        for (const [key, values] of data.entries()) {
            cards.push(
                <Card title={key} style={{marginTop: 24}} key={key}>
                    <Row gutter={[16, 16]}>
                        {values.map((ship, index) => <ShipyardCard ship={ship} index={index} key={index}/>)}
                    </Row>
                </Card>
            )
        }

        return cards;
    }

    return (
        <div>
            {renderCards()}
        </div>
    )
}