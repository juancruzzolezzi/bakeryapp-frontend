import { configureStore } from "@reduxjs/toolkit";
import homeSlice from "./slice/homeSlice";
import authSlice from "./slice/authSlice";
import { appApi } from "../api/appApi";

export const store = configureStore({
    reducer: {
        homeSlice,
        authSlice,
        [appApi.reducerPath]: appApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(appApi.middleware),
});
