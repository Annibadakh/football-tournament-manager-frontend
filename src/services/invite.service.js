import { request } from "@/services/request";

export const getInvite = (token) =>
  request(
    { method: "get", url: `/invites/${token}`, skipAuthRefresh: true },
    { errorToast: false },
  );

// Guests send password + phone; logged-in players send an empty body
export const acceptInvite = (token, data = {}) =>
  request({ method: "post", url: `/invites/${token}/acceptance`, data });

export const declineInvite = (token) =>
  request({ method: "post", url: `/invites/${token}/decline` });

export const listMyInvitations = () => request({ method: "get", url: "/me/invitations" });

export const respondToInvitation = (inviteId, accept) =>
  request({ method: "post", url: `/me/invitations/${inviteId}/response`, data: { accept } });
