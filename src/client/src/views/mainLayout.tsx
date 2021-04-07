import React, {useState} from 'react';
import {TestComponent} from "../components/testComponent";
import {Layout} from "antd";
import {SideMenu} from "../components/sideMenu";
import {Route, Switch} from "react-router-dom";
import {LayoutNavbar} from "../components/navbar";

const {Content} = Layout;

export const MainLayout = () => {
    const [sideMenuCollapsed, setSideMenuCollapsed] = useState(false);

    const handleSideMenuCollapse = () => {
        setSideMenuCollapsed(prevState => !prevState);
    };

    return (
        <Layout style={{minHeight: '100vh'}}>
            <SideMenu collapsed={sideMenuCollapsed} handleOnCollapse={handleSideMenuCollapse}/>

            <Layout style={{overflow: "auto", height: "100vh"}}>
                <LayoutNavbar
                    collapsed={sideMenuCollapsed}
                    handleOnCollapse={handleSideMenuCollapse}
                />

                <Content style={{margin: '24px 16px 0', overflow: "auto", height: "100vh"}}>
                    <div style={{padding: 24, background: '#fff', minHeight: 20}}>
                        {/* Routing here */}

                        <Switch>
                            <Route path='/' exact>
                                Eluwa
                                <div className="App">
                                    <TestComponent/>
                                </div>
                            </Route>
                        </Switch>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}