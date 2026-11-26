import { request } from "@/services/request";

export const listTournamentTeams = (tournamentId, params) =>
  request({ method: "get", url: `/tournaments/${tournamentId}/teams`, params });

export const addTeam = (tournamentId, data) =>
  request({ method: "post", url: `/tournaments/${tournamentId}/teams`, data });

export const requestTeam = (tournamentId, data) =>
  request({ method: "post", url: `/tournaments/${tournamentId}/team-requests`, data });

export const getTeam = (teamId, options) =>
  request({ method: "get", url: `/teams/${teamId}` }, options);

export const updateTeam = (teamId, data) =>
  request({ method: "patch", url: `/teams/${teamId}`, data });

export const reviewTeam = (teamId, data) =>
  request({ method: "patch", url: `/teams/${teamId}/review`, data });

export const setTeamLock = (teamId, isLocked) =>
  request({ method: "patch", url: `/teams/${teamId}/lock`, data: { isLocked } });

export const withdrawTeam = (teamId) =>
  request({ method: "post", url: `/teams/${teamId}/withdrawal` });

export const removeTeam = (teamId) => request({ method: "delete", url: `/teams/${teamId}` });

export const invitePlayer = (teamId, data) =>
  request({ method: "post", url: `/teams/${teamId}/members`, data });

export const updatePlayer = (teamId, memberId, data) =>
  request({ method: "patch", url: `/teams/${teamId}/members/${memberId}`, data });

export const removePlayer = (teamId, memberId) =>
  request({ method: "delete", url: `/teams/${teamId}/members/${memberId}` });

export const resendPlayerInvite = (teamId, memberId) =>
  request({ method: "post", url: `/teams/${teamId}/members/${memberId}/invites` });

export const listStaff = (tournamentId) =>
  request({ method: "get", url: `/tournaments/${tournamentId}/staff` });

export const inviteStaff = (tournamentId, data) =>
  request({ method: "post", url: `/tournaments/${tournamentId}/staff`, data });

export const removeStaff = (tournamentId, staffId) =>
  request({ method: "delete", url: `/tournaments/${tournamentId}/staff/${staffId}` });

export const searchPlayers = (params, options) =>
  request({ method: "get", url: "/players", params, ...options });

export const listMyTeams = () => request({ method: "get", url: "/me/teams" });
