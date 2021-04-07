import React from 'react';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    QuestionCircleOutlined,
    GlobalOutlined,
    BellOutlined,
    LogoutOutlined, SettingOutlined,
} from '@ant-design/icons';
import {Layout, Menu, Badge} from 'antd';
import {UserAvatar} from "../userAvatar";
import {useHistory} from "react-router-dom";
import './style.scss';

const {Header} = Layout;
const {SubMenu} = Menu;

interface Props {
    handleOnCollapse: () => void;
    collapsed: boolean;
}

export const LayoutNavbar: React.FC<Props> = ({collapsed, handleOnCollapse}) => {
    const history = useHistory();

    const getCollapseIcon = () => {
        if (collapsed) {
            return <MenuUnfoldOutlined onClick={handleOnCollapse} className="collapse-icon"/>;
        }

        return <MenuFoldOutlined onClick={handleOnCollapse} className="collapse-icon"/>;
    };

    const handleLanguageMenuClick = () => {
        console.log('Menu click');
    };

    const handleProfileClick = (data: any) => {
        const path = data.key;
        if (path) {
            history.push(path);
        }
    }

    return (
        <Header className="header" style={{background: '#fff', padding: 0}}>
            <div
                style={{
                    float: 'left',
                    width: '100%',
                    alignSelf: 'center',
                    display: 'flex',
                }}
            >
                {window.innerWidth > 992 && getCollapseIcon()}
            </div>

            <Menu
                onClick={handleLanguageMenuClick}
                mode="horizontal"
                className="menu"
            >
                <SubMenu title={<QuestionCircleOutlined/>}/>
            </Menu>

            <Menu
                onClick={handleLanguageMenuClick}
                mode="horizontal"
                className="menu"
            >
                <SubMenu
                    title={
                        <Badge dot>
                            <BellOutlined/>
                        </Badge>
                    }
                />
            </Menu>

            <Menu
                onClick={handleLanguageMenuClick}
                mode="horizontal"
                className="menu"
            >
                <SubMenu title={<GlobalOutlined/>}>
                    <Menu.Item key="en">
                        <span role="img" aria-label="English">
                          🇺🇸 English
                        </span>
                    </Menu.Item>
                    <Menu.Item key="it">
                        <span role="img" aria-label="Italian">
                          🇮🇹 Italian
                        </span>
                    </Menu.Item>
                </SubMenu>
            </Menu>

            <Menu onClick={handleProfileClick} mode="horizontal" className="menu">
                <SubMenu title={UserAvatar('PezeM')}>
                    <Menu.Item key="settings">
                        <span>
                          <SettingOutlined/>
                          Settings
                        </span>
                    </Menu.Item>
                    <Menu.Item key="logout">
                        <span>
                          <LogoutOutlined onClick={handleLanguageMenuClick}/>
                          Logout
                        </span>
                    </Menu.Item>
                </SubMenu>
            </Menu>

        </Header>
    );
}