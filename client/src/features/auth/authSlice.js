import { createSlice } from "@reduxjs/toolkit";

const stored = localStorage.getItem("auth");
const initial = stored ? JSON.parse(stored) : { user: null, accessToken: null, refreshToken: null, loading: false };

const authSlice = createSlice({
  name: "auth",
  initialState: initial,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      localStorage.setItem("auth", JSON.stringify({ user, accessToken, refreshToken }));
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      const stored = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem("auth", JSON.stringify({ ...stored, ...action.payload }));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      const stored = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem("auth", JSON.stringify({ ...stored, user: state.user }));
    },
    logout: (state) => {
      state.user = null; state.accessToken = null; state.refreshToken = null;
      localStorage.removeItem("auth");
    },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setCredentials, setTokens, updateUser, logout, setLoading } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAuth = (state) => !!state.auth.accessToken;
export const selectRole = (state) => state.auth.user?.role;
export default authSlice.reducer;
