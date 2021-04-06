export interface AppSettings {
    port: number;
    baseUrl: string;
}

export type SettingsKeys = keyof AppSettings;
export type SettingsValue = AppSettings[SettingsKeys];