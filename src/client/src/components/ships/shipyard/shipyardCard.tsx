import {Button, Card, Col, message, Modal, Radio, Row, Typography} from "antd";
import React, {useState} from "react";
import {ShopShip} from "spacetraders-api-sdk";
import {ThunderboltOutlined, CreditCardOutlined, TagOutlined} from "@ant-design/icons";
import {ChipIcon} from "../../icons/chipIcon";
import {TruckIcon} from "../../icons/truckIcon";
import {SparklesIcon} from "../../icons/sparklesIcon";
import {useApiHook} from "../../../api/apiHook";
import {Ship} from "../../../../../server/models/ship";

const {Text} = Typography;

interface Props {
    ship: ShopShip;
    index: number;
}

export const ShipyardCard: React.FC<Props> = ({ship, index}) => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [buyLocation, setBuyLocation] = useState<string | undefined>(undefined);
    const [makeRequest] = useApiHook();

    const showBuyShipModal = () => {
        setIsModalVisible(true);
    }

    const buyShip = async () => {
        setIsLoading(true);

        try {
            await makeRequest<Ship>('ship-shop/buy', "POST", {
                shipType: ship.type,
                location: buyLocation
            });

            message.success(`Successfully bought ship ${ship.type}`);
        } catch (e) {
            console.error(e);
            message.error(`Error buying ship ${ship.type}`);
        }

        setBuyLocation(undefined);
        setIsLoading(false);
        closeModal();
    }

    const closeModal = () => {
        setIsModalVisible(false);
    }

    const onSelectLocation = (e: any) => {
        setBuyLocation(e.target.value);
    }

    return (
        <Col span={8}>
            <Modal title="Select buy location and price" visible={isModalVisible}
                   confirmLoading={isModalVisible}
                   footer={[
                       <Button key="back" onClick={closeModal}>
                           Cancel
                       </Button>,
                       <Button key="submit" type="primary" onClick={buyShip} loading={isLoading}
                               disabled={!buyLocation}>
                           Buy
                       </Button>
                   ]}>

                <Radio.Group onChange={onSelectLocation}>
                    {ship.purchaseLocations.map((location, locationIndex) => {
                        return (
                            <Radio style={{
                                display: 'block',
                                height: '30px',
                                lineHeight: '30px',
                            }} value={location.location} key={locationIndex}>
                                {location.location} ${location.price}
                            </Radio>
                        )
                    })}
                </Radio.Group>
            </Modal>

            <Card type="inner" title={ship.type} style={{marginTop: index > 2 ? 16 : 0}} actions={[
                <CreditCardOutlined key="buy" onClick={showBuyShipModal}/>
            ]}>
                <Row>
                    <Col span={12}>
                        <TagOutlined/> <Text strong>Class</Text>
                    </Col>
                    <Col span={12}>
                        {ship.class}
                    </Col>

                    <Col span={12}>
                        <TruckIcon/> <Text strong>Max cargo</Text>
                    </Col>
                    <Col span={12}>
                        {ship.maxCargo}
                    </Col>

                    <Col span={12}>
                        <ThunderboltOutlined/> <Text strong>Speed</Text>
                    </Col>
                    <Col span={12}>
                        {ship.speed}
                    </Col>

                    <Col span={12}>
                        <ChipIcon/> <Text strong>Plating</Text>
                    </Col>
                    <Col span={12}>
                        {ship.plating}
                    </Col>

                    <Col span={12}>
                        <SparklesIcon/> <Text strong>Weapons</Text>
                    </Col>
                    <Col span={12}>
                        {ship.weapons}
                    </Col>
                </Row>
            </Card>
        </Col>
    )
}