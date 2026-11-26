import { request } from "@/services/request";

export const listUsers = (params, options) =>
  request({ method: "get", url: "/users", params, ...options });

export const createUser = (data) => request({ method: "post", url: "/users", data });

export const setUserBlocked = (userId, isBlocked) =>
  request({ method: "patch", url: `/users/${userId}/status`, data: { isBlocked } });

export const resendUserInvite = (userId) =>
  request({ method: "post", url: `/users/${userId}/invites` });
