import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import createRootReducer from './rootReducer';

const rootReducer = createRootReducer();

export const configuredStore = () => {
    const store = configureStore({
        reducer: rootReducer
    });

    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && module.hot) {
        // @ts-ignore
        module.hot.accept('./rootReducer', () => store.replaceReducer(rootReducer))
    }

    return store;
};

export type RootState = ReturnType<typeof rootReducer>;
export type Store = ReturnType<typeof configuredStore>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;