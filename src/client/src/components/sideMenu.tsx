import React, {ReactInstance} from 'react';
import {Layout, Menu} from 'antd';
import {useHistory, useLocation} from 'react-router-dom';
import {
    DashboardOutlined,
    FundProjectionScreenOutlined,
    PartitionOutlined,
    SettingOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import {Key} from "antd/es/table/interface";
import {useSelector} from "react-redux";
import {selectSettings} from "../features/settings/settingsSlice";
import {ROUTES} from "../constants/routes";

const {SubMenu} = Menu;

const {Sider} = Layout;

interface Props {
    handleOnCollapse: () => void;
    collapsed: boolean;
}

export const SideMenu: React.FC<Props> = ({handleOnCollapse, collapsed}) => {
    const theme = useSelector(selectSettings).theme;
    const history = useHistory();
    const location = useLocation();

    const handleSideMenuClick = (action: { item: ReactInstance, key: Key, keyPath: Key[] }) => {
        console.log('menu:', action);

        const path = action.key;
        if (path) {
            history.push(path.toString());
        }
    };

    return (
        <Sider
            breakpoint="lg"
            collapsedWidth="80"
            onCollapse={handleOnCollapse}
            collapsed={collapsed}
            width="256"
            theme={theme}
            style={{
                overflow: 'auto',
                height: '100vh',
                left: 0,
            }}
        >
            <a>
                <div className="menu-logo"/>
            </a>

            <Menu mode="inline" theme={theme} onClick={handleSideMenuClick} selectedKeys={[location.pathname]}>
                <Menu.Item key={ROUTES.Dashboard}>
                    <DashboardOutlined/>
                    <span className="nav-text">Dashboard</span>
                </Menu.Item>

                <Menu.Item key={ROUTES.OwnShips}>
                    <SettingOutlined/>
                    <span className="nav-text">Own ships</span>
                </Menu.Item>

                <Menu.Item key={ROUTES.ShipShop}>
                    <SettingOutlined/>
                    <span className="nav-text">Shipyard</span>
                </Menu.Item>

                <SubMenu
                    key="products"
                    title={
                        <span>
                          <PartitionOutlined/>
                          <span>Products</span>
                            </span>
                    }
                >
                    <Menu.Item key="showProducts">
                        <span className="nav-text">Show Products</span>
                    </Menu.Item>
                    <Menu.Item key="addProduct">
                        <span className="nav-text">Add Product</span>
                    </Menu.Item>
                </SubMenu>

                <SubMenu
                    key="customers"
                    title={
                        <span>
                              <TeamOutlined/>
                              <span>Customers</span>
                            </span>
                    }
                >
                    <Menu.Item key="showCustomers">
                        <span className="nav-text">Show Customers</span>
                    </Menu.Item>
                    <Menu.Item key="addCustomer">
                        <span className="nav-text">Add Customer</span>
                    </Menu.Item>
                </SubMenu>

                <Menu.Item key={ROUTES.Settings}>
                    <SettingOutlined/>
                    <span className="nav-text">Settings</span>
                </Menu.Item>

                <Menu.Item key="reports">
                    <FundProjectionScreenOutlined/>
                    <span className="nav-text">Reports</span>
                </Menu.Item>
            </Menu>
        </Sider>
    );
}
