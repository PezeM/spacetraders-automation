import React, {useState} from 'react';
import {Button, Input, Space, Table, Tag} from "antd";
import {Ship} from "../../../../../server/models/ship";
import {Cargo} from "spacetraders-api-sdk";
import {BooleanIconColumn} from "../../table/booleanIconColumn";
import Highlighter from 'react-highlight-words';
import {SearchOutlined} from '@ant-design/icons';
import {sumShipCargoQuantity} from "../../../helpers/ship";
import {getUniqueValuesFromArray, mapArrayToValueText} from "../../../helpers/arrays";
import {ShipActionMenu} from "../../table/shipActionMenu";
import {Key} from "antd/es/table/interface";
import {Breakpoint} from "antd/es/_util/responsiveObserve";
import {getColorOfItem} from "../../../helpers/color";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 0;

interface Props {
    ships: Ship[];
}

export const OwnShipTable: React.FC<Props> = ({ships}) => {
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const [selectedRow, setSelectedRow] = useState<Ship | undefined>(undefined);
    const [searchText, setSearchText] = useState<string>('');
    const [searchedColumn, setSearchedColumn] = useState<string>('');

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys: Key[]) => {
            setSelectedRowKeys(selectedRowKeys);
        },
    };

    const resetPagination = () => {
        setCurrentPage(DEFAULT_PAGE_NUMBER);
    };

    const handleTableChange = (pagination: any) => {
        setCurrentPage(pagination.current - 1);
    };

    const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    }

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    }

    function getColumnSearchProps<T extends keyof Ship>(dataIndex: T) {
        return ({
            // @ts-ignore
            filterDropdown({setSelectedKeys, selectedKeys, confirm, clearFilters}) {
                return (
                    <div style={{padding: 8}}>
                        <Input
                            placeholder={`Filter ${dataIndex}`}
                            value={selectedKeys[0]}
                            onChange={(e) =>
                                setSelectedKeys(e.target.value ? [e.target.value] : [])
                            }
                            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                            style={{width: 188, marginBottom: 8, display: 'block'}}
                        />
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                                icon={<SearchOutlined/>}
                                size="small"
                                style={{width: 90}}
                            >
                                Search
                            </Button>
                            <Button
                                onClick={() => handleReset(clearFilters)}
                                size="small"
                                style={{width: 90}}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            filterIcon(filtered: boolean) {
                return (
                    <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>
                );
            },
            onFilter(value: any, record: any) {
                return record[dataIndex]
                    ? record[dataIndex]
                        .toString()
                        .toLowerCase()
                        .includes(value.toLowerCase())
                    : '';
            },
            render(text: string) {
                return searchedColumn === dataIndex ? (
                    <Highlighter
                        highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={text ? text.toString() : ''}
                    />
                ) : (
                    text
                );
            },
        });
    }

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a: Ship, b: Ship) => a.id.localeCompare(b.id),
            ...getColumnSearchProps('id'),
            responsive: ['md'] as Breakpoint[]
        },
        {
            title: 'Location',
            dataIndex: 'location',
            sorter: (a: Ship, b: Ship) => a.location.localeCompare(b.location),
            ...getColumnSearchProps('location')
        },
        {
            title: 'Type',
            dataIndex: 'type',
            sorter: (a: Ship, b: Ship) => a.type.localeCompare(b.type),
            ...getColumnSearchProps('type'),

        },
        {
            title: 'Busy',
            dataIndex: 'isBusy',
            render: (data: boolean) => <BooleanIconColumn status={data}/>,
            sorter: (a: Ship, b: Ship) => Number(a.isBusy) - Number(b.isBusy),
            filters: getUniqueValuesFromArray(ships, 'isBusy')
                .map(v => {
                    return {value: v, text: v ? 'True' : 'False'}
                }),
            filterMultiple: true,
            onFilter: (value: any, ship: Ship) => ship.isBusy === value,
        },
        {
            title: 'Scout ship',
            dataIndex: 'isScoutShip',
            render: (data: boolean) => <BooleanIconColumn status={data}/>,
            sorter: (a: Ship, b: Ship) => Number(a.isScoutShip) - Number(b.isScoutShip),
            filters: getUniqueValuesFromArray(ships, 'isScoutShip')
                .map(v => {
                    return {value: v, text: v ? 'True' : 'False'}
                }),
            filterMultiple: true,
            onFilter: (value: any, ship: Ship) => ship.isScoutShip === value,
            responsive: ['lg'] as Breakpoint[]
        },
        {
            title: 'Cargo',
            dataIndex: 'cargo',
            render: (cargo: Cargo[]) => (
                <>
                    {cargo.map((item: Cargo) => {
                        return (
                            <Tag color={getColorOfItem(item.good, 5)} key={item.good}>
                                {item.good} x{item.quantity}
                            </Tag>
                        );
                    })}
                </>
            ),
            filters: mapArrayToValueText(getUniqueValuesFromArray(getUniqueValuesFromArray(ships, 'cargo'), 'good')),
            filterMultiple: true,
            onFilter: (value: any, ship: Ship) => ship.cargo?.some(c => c.good === value),
            sorter: (a: Ship, b: Ship) => {
                if (!a.cargo || !b.cargo) return 0;
                return sumShipCargoQuantity(a) - sumShipCargoQuantity(b);
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: () => <ShipActionMenu selectedRow={selectedRow}/>,
        },
    ]

    return (
        <Table
            rowKey={record => record.id}
            rowSelection={rowSelection}
            dataSource={ships}
            columns={columns}
            onChange={handleTableChange}
            scroll={{x: 500}}
            onRow={record => {
                return {
                    onClick: () => {
                        setSelectedRow(record);
                    },
                };
            }}
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