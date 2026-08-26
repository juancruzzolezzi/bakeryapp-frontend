import { createSlice } from "@reduxjs/toolkit";

const savedAuth = (() => {
    try {
        return JSON.parse(localStorage.getItem("auth"));
    } catch {
        return null;
    }
})();

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: savedAuth?.user || null,
        token: savedAuth?.token || null,
    },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem("auth", JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("auth");
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
