import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { base_URL } from "./base_URL";

export const appApi = createApi({
    reducerPath: "appApi",

    baseQuery: fetchBaseQuery({
        baseUrl: base_URL,
    }),

    endpoints: (builder) => ({
        getProducts: builder.query({
            query: () => "products",
        }),

        registerUser: builder.mutation({
            query: (body) => ({ url: "register", method: "POST", body }),
        }),

        loginUser: builder.mutation({
            query: (body) => ({ url: "login", method: "POST", body }),
        }),

        googleLogin: builder.mutation({
            query: (body) => ({ url: "auth/google", method: "POST", body }),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useRegisterUserMutation,
    useLoginUserMutation,
    useGoogleLoginMutation,
} = appApi;
