import { request } from "@/services/request";

// Auth calls never trigger the automatic refresh-and-retry (they are the refresh flow)
const authRequest = (config, options) => request({ ...config, skipAuthRefresh: true }, options);

export const register = (data) => authRequest({ method: "post", url: "/auth/register", data });

export const login = (data) => authRequest({ method: "post", url: "/auth/login", data });

export const refreshSession = () =>
  authRequest({ method: "post", url: "/auth/refresh" }, { errorToast: false, successToast: false });

export const logout = () =>
  authRequest({ method: "post", url: "/auth/logout" }, { successToast: false });

export const logoutAllDevices = () => request({ method: "post", url: "/auth/logout-all" });

export const sendEmailOtp = () => request({ method: "post", url: "/auth/email-otp" });

export const verifyEmail = (data) =>
  request({ method: "post", url: "/auth/email-verification", data });

export const requestPasswordReset = (data) =>
  authRequest({ method: "post", url: "/auth/password-reset-otp", data });

export const resetPassword = (data) =>
  authRequest({ method: "post", url: "/auth/password-reset", data });
