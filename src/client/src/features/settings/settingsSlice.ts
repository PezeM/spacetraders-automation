import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../store';
import {AppSettings, SettingsKeys, SettingsValue} from "../../types/settings.interface";

interface ConfigKey {
    key: SettingsKeys;
    value: SettingsValue;
}

export const DEFAULT_SETTINGS: AppSettings = {
    baseUrl: 'http://localhost',
    port: 8080,
    theme: "dark"
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState: DEFAULT_SETTINGS,
    reducers: {
        updateSettings(state, action: PayloadAction<AppSettings>) {
            Object.assign(state, action.payload);
        },
        updateKey(state, action: PayloadAction<ConfigKey>) {
            const {key, value} = action.payload;
            const oldValue = state[key];
            if (oldValue === value) return;

            // @ts-ignore
            state[key] = value;
        }
    }
});

export const {
    updateKey,
    updateSettings
} = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings;
export default settingsSlice.reducer;