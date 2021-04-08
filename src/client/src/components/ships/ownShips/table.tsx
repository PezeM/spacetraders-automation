import React, {useState} from 'react';
import {Table, Tag} from "antd";
import {Ship} from "../../../../../server/models/ship";
import {getColorOfGood} from "../../../helpers/goods";
import {Cargo} from "spacetraders-api-sdk";
import {
    CheckOutlined, CloseOutlined
} from '@ant-design/icons';
import {BooleanIconColumn} from "../../table/booleanIconColumn";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 0;

interface Props {
    ships: Ship[];
}

const columns = [
    {
        title: 'Id',
        dataIndex: 'id'
    },
    {
        title: 'Location',
        dataIndex: 'location'
    },
    {
        title: 'Type',
        dataIndex: 'type'
    },
    {
        title: 'Busy',
        dataIndex: 'isBusy',
        render: (data: boolean) => <BooleanIconColumn status={data}/>
    },
    {
        title: 'Scout ship',
        dataIndex: 'isScoutShip',
        render: (data: boolean) => <BooleanIconColumn status={data}/>
    },
    {
        title: 'Cargo',
        dataIndex: 'cargo',
        render: (cargo: Cargo[]) => (
            <>
                {cargo.map((item: Cargo) => {
                    return (
                        <Tag color={getColorOfGood(item.good)} key={item.good}>
                            {item.good} x{item.quantity}
                        </Tag>
                    );
                })}
            </>
        )
    }
]

export const OwnShipTable: React.FC<Props> = ({ships}) => {
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const resetPagination = () => {
        setCurrentPage(DEFAULT_PAGE_NUMBER);
    };

    const handleTableChange = (pagination: any) => {
        setCurrentPage(pagination.current - 1);
    };

    return (
        <Table
            rowKey={record => record.id}
            dataSource={ships}
            columns={columns}
            onChange={handleTableChange}
            pagination={{
                pageSize: DEFAULT_PAGE_SIZE,
                current: currentPage + 1,
                total: ships.length,
                showTotal: (total, range) => {
                    return `${range[0]}-${range[1]} of ${total} ships`;
                }
            }}/>
    )
}