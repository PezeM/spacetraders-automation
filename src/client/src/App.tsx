import React from 'react';
import './App.css';
import {SWRConfig} from 'swr';
import {BASE_PORT} from "./constants/server";
import {fetcher} from "./api";
import {BrowserRouter, Switch} from "react-router-dom";
import {MainLayout} from "./views/mainLayout";

function App() {
    return (
        <SWRConfig value={{
            fetcher: (url, ...args: any[]) => fetcher(BASE_PORT, url, ...args),
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
