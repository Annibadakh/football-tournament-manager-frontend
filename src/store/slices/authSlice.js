import { createSlice } from "@reduxjs/toolkit";

// Session shape only; login, refresh and logout flows are built in Phase 1
const initialState = {
  user: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    clearSession: () => initialState,
  },
});

export const { setSession, clearSession } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);

export default authSlice.reducer;
