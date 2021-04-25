import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../store';
import {AppSettings, SettingsKeys, SettingsValue} from "../../types/settings.interface";
import {MenuTheme} from "antd";

interface ConfigKey {
    key: SettingsKeys;
    value: SettingsValue;
}

export const DEFAULT_SETTINGS: AppSettings = {
    baseUrl: localStorage.getItem('baseUrl') ?? 'http://localhost',
    port: localStorage.getItem('port') ? parseInt(localStorage.getItem('port') as string) : 8080,
    theme: localStorage.getItem('theme') as MenuTheme ?? "dark"
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState: DEFAULT_SETTINGS,
    reducers: {
        updateSettings(state, action: PayloadAction<AppSettings>) {
            Object.assign(state, action.payload);
            for (const [key, value] of Object.entries(action.payload)) {
                localStorage.setItem(key, value.toString());
            }
        },
        updateKey(state, action: PayloadAction<ConfigKey>) {
            const {key, value} = action.payload;
            const oldValue = state[key];
            if (oldValue === value) return;

            // @ts-ignore
            state[key] = value;
            localStorage.setItem(key, value.toString());
        }
    }
});

export const {
    updateKey,
    updateSettings
} = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings;
export default settingsSlice.reducer;