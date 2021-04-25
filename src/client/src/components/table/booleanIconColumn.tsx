import React from 'react';
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";

interface Props {
    status: boolean;
}

export const BooleanIconColumn: React.FC<Props> = ({status}) => {
    return status ? <CheckOutlined/> : <CloseOutlined/>;
}