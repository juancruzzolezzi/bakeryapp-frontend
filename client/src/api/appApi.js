import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { base_URL } from "./base_URL";

export const appApi = createApi({
    reducerPath: "appApi",

    baseQuery: fetchBaseQuery({
        baseUrl: base_URL,
    }),

    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => "categories",
        }),

        getProducts: builder.query({
            query: () => "products",
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetProductsQuery,
} = appApi;
