import React, {useState} from 'react';
import {Location} from "spacetraders-api-sdk";
import {Button, Input, Space, Table, Tag} from "antd";
import {Breakpoint} from "antd/es/_util/responsiveObserve";
import {SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import {getUniqueValuesFromArray, mapArrayToValueText} from "../helpers/arrays";
import {getColorOfItem} from "../helpers/color";

interface Props {
    locations: Location[];
}

export const LocationsTable: React.FC<Props> = ({locations}) => {
    const [searchText, setSearchText] = useState<string>('');
    const [searchedColumn, setSearchedColumn] = useState<string>('');

    const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    }

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    }

    function getColumnSearchProps<T extends keyof Location>(dataIndex: T) {
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
            title: 'Symbol',
            dataIndex: 'symbol',
            sorter: (a: Location, b: Location) => a.symbol.localeCompare(b.symbol),
            ...getColumnSearchProps('symbol'),
            responsive: ['md'] as Breakpoint[]
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a: Location, b: Location) => a.name.localeCompare(b.name),
            ...getColumnSearchProps('name')
        },
        {
            title: 'Type',
            dataIndex: 'type',
            sorter: (a: Location, b: Location) => a.type.localeCompare(b.type),
            filters: mapArrayToValueText(getUniqueValuesFromArray(locations, 'type')),
            filterMultiple: true,
            onFilter: (value: any, location: Location) => location.type === value,
            render: (text: string): JSX.Element | string => {
                return <Tag color={getColorOfItem(text, 6)}>
                    {text}
                </Tag>
            }
        },
        {
            title: 'X',
            dataIndex: 'x',
            sorter: (a: Location, b: Location) => Number(a.x) - Number(b.x),
            responsive: ['md'] as Breakpoint[]
        },
        {
            title: 'Y',
            dataIndex: 'y',
            sorter: (a: Location, b: Location) => Number(a.y) - Number(b.y),
            responsive: ['md'] as Breakpoint[]
        },
        {
            title: 'Ansible Progress',
            dataIndex: 'ansibleProgress',
            sorter: (a: Location, b: Location) => Number(a.ansibleProgress) - Number(b.ansibleProgress),
            render: (data: number) => <span>{data ? data : 'No progress'}</span>,
            responsive: ['md'] as Breakpoint[]
        }
    ]

    return (
        <Table
            dataSource={locations}
            columns={columns}
            scroll={{x: 500}}
        />
    )
}