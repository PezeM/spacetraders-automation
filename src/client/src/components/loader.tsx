import {Col, Row, Spin} from "antd";
import React from "react";
import {LoadingOutlined} from '@ant-design/icons';

interface Props {
    size?: number;
    loadingTip?: string;
}

export const Loader: React.FC<Props> = ({size = 24, loadingTip = "Loading..."}) => {
    const indicator = <LoadingOutlined style={{fontSize: size}} spin/>

    return (
        <Row justify={"center"} align={"middle"}>
            <Col>
                <Spin indicator={indicator} tip={loadingTip}/>
            </Col>
        </Row>
    )
}