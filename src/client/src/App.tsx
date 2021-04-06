import React from 'react';
import './App.css';
import {SWRConfig} from 'swr';
import {fetcher} from "./api";
import {BrowserRouter, Switch} from "react-router-dom";
import {MainLayout} from "./views/mainLayout";
import {selectSettings} from "./features/settings/settingsSlice";
import {useSelector} from "react-redux";

function App() {
    const settings = useSelector(selectSettings);

    return (
        <SWRConfig value={{
            fetcher: (url, ...args: any[]) => fetcher(settings.port, url, ...args),
            revalidateOnFocus: true
        }}>
            <BrowserRouter>
                <Switch>
                    <MainLayout/>
                </Switch>
            </BrowserRouter>
        </SWRConfig>
    );
}

export default App;
