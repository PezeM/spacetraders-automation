import { combineReducers } from 'redux';
import settingsReducer from './features/settings/settingsSlice';

export default function createRootReducer() {
    return combineReducers({
        settings: settingsReducer
    });
}