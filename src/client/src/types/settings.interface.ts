import {MenuTheme} from "antd";

export interface AppSettings {
    port: number;
    baseUrl: string;
    theme: MenuTheme;
}

export type SettingsKeys = keyof AppSettings;
export type SettingsValue = AppSettings[SettingsKeys];