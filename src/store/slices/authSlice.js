import { createSlice } from "@reduxjs/toolkit";
import { ACCOUNT_STATUS } from "@/constants/user.constants";

// "checking" until the silent refresh on app load tells us whether a session exists
export const SESSION_STATUS = Object.freeze({
  CHECKING: "checking",
  READY: "ready",
});

const initialState = {
  user: null,
  accessToken: null,
  status: SESSION_STATUS.CHECKING,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = SESSION_STATUS.READY;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearSession: () => ({ ...initialState, status: SESSION_STATUS.READY }),
  },
});

export const { setSession, setUser, clearSession } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectIsSessionReady = (state) => state.auth.status === SESSION_STATUS.READY;
export const selectIsVerified = (state) =>
  state.auth.user?.accountStatus === ACCOUNT_STATUS.VERIFIED;

export default authSlice.reducer;
