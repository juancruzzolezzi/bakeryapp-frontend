import { configureStore } from "@reduxjs/toolkit";
import homeSlice from "./slice/homeSlice";
import { appApi } from "../api/appApi";
import authSlice from "./slice/authSlice";

export const store = configureStore({
    reducer: {
        homeSlice,
        [appApi.reducerPath]: appApi.reducer,
        authSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(appApi.middleware),
});
