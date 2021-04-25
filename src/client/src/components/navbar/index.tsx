import React from 'react';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    QuestionCircleOutlined,
    GlobalOutlined,
    BellOutlined,
    LogoutOutlined, SettingOutlined, DollarOutlined,
} from '@ant-design/icons';
import {Layout, Menu, Badge} from 'antd';
import {UserAvatar} from "../userAvatar";
import {useHistory, useLocation} from "react-router-dom";
import './style.scss';
import {ROUTES} from "../../constants/routes";
import useSWR from "swr";
import {GameUser} from "../../../../server/types/user.interface";

const {Header} = Layout;
const {SubMenu} = Menu;

interface Props {
    handleOnCollapse: () => void;
    collapsed: boolean;
}

export const LayoutNavbar: React.FC<Props> = ({collapsed, handleOnCollapse}) => {
    const history = useHistory();
    const location = useLocation();
    const {data} = useSWR<GameUser>('user/');

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

            <div className="menu money-display">
                <DollarOutlined/>
                <span>
                    ${data?.credits ?? 0}
                </span>
            </div>

            <Menu
                onClick={handleLanguageMenuClick}
                mode="horizontal"
                className="menu"
                selectedKeys={[location.pathname]}
            >
                <SubMenu title={<QuestionCircleOutlined/>}/>
            </Menu>

            <Menu
                onClick={handleLanguageMenuClick}
                mode="horizontal"
                className="menu"
                selectedKeys={[location.pathname]}
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
                selectedKeys={[location.pathname]}
            >
                <SubMenu title={<GlobalOutlined/>}>
                    <Menu.Item key="en">
                        <span role="img" aria-label="English">
                          🇺🇸 English
                        </span>
                    </Menu.Item>
                </SubMenu>
            </Menu>

            <Menu onClick={handleProfileClick} mode="horizontal" className="menu" selectedKeys={[location.pathname]}>
                <SubMenu title={UserAvatar(data?.username ?? 'No user')}>
                    <Menu.Item key={ROUTES.Settings}>
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