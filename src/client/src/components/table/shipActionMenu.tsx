import {Dropdown, Menu, message, Popconfirm} from 'antd';
import React from 'react';
import {QuestionCircleOutlined, DeleteOutlined, DownOutlined, EditOutlined} from "@ant-design/icons";
import {Ship} from "../../../../server/models/ship";
import {mutate} from "swr";
import {useApiHook} from "../../api/apiHook";
import {ApiError} from "../../api/apiError";

interface Props {
    selectedRow?: Ship;
}

type Type = (props: Props) => JSX.Element[];

export const useShipActionMenu: Type = ({selectedRow}) => {
    const [makeRequest] = useApiHook();

    const handleMenuClick = (action: any) => {
        console.log(action);
    };

    const handleShipSell = async () => {
        if (!selectedRow) return;

        try {
            const result = await makeRequest<any>(`ship/${selectedRow.id}`, 'DELETE');
            console.log('result', result);

            await mutate('ship/');
        } catch (e) {
            await message.error(e.errors[0] ?? 'Error selling ship');
        }
    };

    const actionMenu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="edit">
                <EditOutlined/>
                Some action
            </Menu.Item>
            <Menu.Item key="delete">
                <Popconfirm
                    title="Sure to sell?"
                    placement="left"
                    icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
                    onConfirm={handleShipSell}
                >
                    <DeleteOutlined type="delete"/>
                    Sell
                </Popconfirm>
            </Menu.Item>
        </Menu>
    );

    const actionColumnView = (
        <span>
          <Dropdown overlay={actionMenu} trigger={['click']}>
            <a className="ant-dropdown-link" href="#">
              Actions <DownOutlined/>
            </a>
          </Dropdown>
        </span>
    );

    return [actionColumnView];
}
