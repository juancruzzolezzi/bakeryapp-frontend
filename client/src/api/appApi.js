import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { base_URL } from "./base_URL";

export const appApi = createApi({
    reducerPath: "appApi",

    baseQuery: fetchBaseQuery({
        baseUrl: base_URL,
        //Si hay sesión, cada pedido lleva el token (lo necesita "Mis
        //pedidos"; las rutas públicas lo ignoran).
        prepareHeaders: (headers, { getState }) => {
            const token = getState().authSlice.token;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),

    tagTypes: ["PedidosLocal"],

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

        solicitarArrepentimiento: builder.mutation({
            query: (body) => ({ url: "arrepentimiento", method: "POST", body }),
        }),

        //Seguimiento de un pedido por el token de su link (página pública).
        getPedido: builder.query({
            query: (token) => `orders/track/${token}`,
            transformResponse: (response) => response.order,
        }),

        //"Mis pedidos" de la cuenta con sesión iniciada.
        getMisPedidos: builder.query({
            query: () => "orders/mine",
            transformResponse: (response) => response.orders,
        }),

        //Panel del local: la clave de admin va en cada pedido.
        getPedidosLocal: builder.query({
            query: (adminKey) => ({ url: "admin/orders", headers: { "x-admin-key": adminKey } }),
            transformResponse: (response) => response.orders,
            providesTags: ["PedidosLocal"],
        }),

        cambiarEstadoPedido: builder.mutation({
            query: ({ adminKey, id, status }) => ({
                url: `admin/orders/${id}/status`,
                method: "PATCH",
                headers: { "x-admin-key": adminKey },
                body: { status },
            }),
            invalidatesTags: ["PedidosLocal"],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useRegisterUserMutation,
    useLoginUserMutation,
    useGoogleLoginMutation,
    useSolicitarArrepentimientoMutation,
    useGetPedidoQuery,
    useGetMisPedidosQuery,
    useGetPedidosLocalQuery,
    useCambiarEstadoPedidoMutation,
} = appApi;
