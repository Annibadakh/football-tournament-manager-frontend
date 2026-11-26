import { request } from "@/services/request";

export const getInvite = (token) =>
  request(
    { method: "get", url: `/invites/${token}`, skipAuthRefresh: true },
    { errorToast: false },
  );

export const acceptInvite = (token, data) =>
  request({ method: "post", url: `/invites/${token}/acceptance`, data, skipAuthRefresh: true });
