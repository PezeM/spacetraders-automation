import {Dropdown, Menu, message, Modal, Popconfirm} from 'antd';
import React, {useState} from 'react';
import {QuestionCircleOutlined, DeleteOutlined, DownOutlined, EditOutlined, InfoOutlined} from "@ant-design/icons";
import {Ship} from "../../../../server/models/ship";
import {mutate} from "swr";
import {useApiHook} from "../../api/apiHook";

interface Props {
    selectedRow?: Ship;
}

export const ShipActionMenu: React.FC<Props> = ({selectedRow}) => {
    const [makeRequest] = useApiHook();
    const [isModalVisible, setModalVisible] = useState(false);

    const handleMenuClick = (action: any) => {
        console.log(action);

        if (action.key === 'show') {
            showFullInfoModal();
        }
    };

    const showFullInfoModal = () => {
        if (!selectedRow) return;

        setModalVisible(true);
    }

    const closeModal = () => {
        setModalVisible(false);
    }

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
            <Menu.Item key="show">
                <InfoOutlined/>
                Show full info
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

    return (
        <span>
            <Modal title="More info" visible={isModalVisible} onOk={closeModal} onCancel={closeModal}>
                <pre>{JSON.stringify(selectedRow, null, 4)}</pre>
            </Modal>

          <Dropdown overlay={actionMenu} trigger={['click']}>
            <a className="ant-dropdown-link" href="#">
              Actions <DownOutlined/>
            </a>
          </Dropdown>
        </span>
    )
}