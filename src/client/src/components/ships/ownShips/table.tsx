import React, {useState} from 'react';
import {Button, Input, Space, Table, Tag} from "antd";
import {Ship} from "../../../../../server/models/ship";
import {getColorOfGood} from "../../../helpers/goods";
import {Cargo} from "spacetraders-api-sdk";
import {BooleanIconColumn} from "../../table/booleanIconColumn";
import Highlighter from 'react-highlight-words';
import {EditOutlined, SearchOutlined} from '@ant-design/icons';
import {sumShipCargoQuantity} from "../../../helpers/ship";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 0;

interface Props {
    ships: Ship[];
}

export const OwnShipTable: React.FC<Props> = ({ships}) => {
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [searchText, setSearchText] = useState<string>('');
    const [searchedColumn, setSearchedColumn] = useState<string>('');

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

    const getColumnSearchProps = (dataIndex: string) => ({
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
        onFilter(value: string, record: any) {
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

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a: Ship, b: Ship) => a.id.localeCompare(b.id)
        },
        {
            title: 'Location',
            dataIndex: 'location',
            sorter: (a: Ship, b: Ship) => a.location.localeCompare(b.location)

        },
        {
            title: 'Type',
            dataIndex: 'type',
            sorter: (a: Ship, b: Ship) => a.type.localeCompare(b.type)
        },
        {
            title: 'Busy',
            dataIndex: 'isBusy',
            render: (data: boolean) => <BooleanIconColumn status={data}/>,
            sorter: (a: Ship, b: Ship) => Number(a.isBusy) - Number(b.isBusy)
        },
        {
            title: 'Scout ship',
            dataIndex: 'isScoutShip',
            render: (data: boolean) => <BooleanIconColumn status={data}/>,
            sorter: (a: Ship, b: Ship) => Number(a.isScoutShip) - Number(b.isScoutShip)
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
            ),
            sorter: (a: Ship, b: Ship) => {
                if (!a.cargo || !b.cargo) return 0;
                return sumShipCargoQuantity(a) - sumShipCargoQuantity(b);
            },
        }
    ]


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