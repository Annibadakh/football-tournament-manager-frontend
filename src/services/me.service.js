import { request } from "@/services/request";

export const getMyProfile = (options) => request({ method: "get", url: "/me" }, options);

export const updateMyProfile = (data, options) =>
  request({ method: "patch", url: "/me", data }, options);

export const replaceMyPositions = (positions) =>
  request({ method: "put", url: "/me/positions", data: { positions } });

export const changeMyPassword = (data) => request({ method: "patch", url: "/me/password", data });
