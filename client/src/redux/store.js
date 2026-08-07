import { configureStore } from "@reduxjs/toolkit";
import homeSlice from "./slice/homeSlice";
import { appApi } from "../api/appApi";

export const store = configureStore({
    reducer: {
        homeSlice,
        [appApi.reducerPath]: appApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(appApi.middleware),
});
