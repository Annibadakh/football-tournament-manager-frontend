import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";

export const createAppStore = (preloadedState) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

const store = createAppStore();

export default store;
