import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "authSlice",
    initialState: {
        user: null,
        userName: "",
        idToken: null,
    },

    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },

        setUserName: (state, action) => {
            state.userName = action.payload;
        },

        setIdToken: (state, action) => {
            state.idToken = action.payload;
        },

        clearUser: (state) => {
            state.user = null;
            state.idToken = null;
            state.userName = null;
        },
    },
});

export const { setIdToken, setUser, clearUser, setUserName } = authSlice.actions;

export default authSlice.reducer;
