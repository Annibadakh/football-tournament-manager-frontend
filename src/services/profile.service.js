import env from "@/config/env";
import { request } from "@/services/request";

export const searchPlayerDirectory = (params, options) =>
  request({ method: "get", url: "/players", params }, options);

export const getPlayerProfile = (playerId, options) =>
  request({ method: "get", url: `/players/${playerId}` }, options);

export const getTeamStats = (teamId, options) =>
  request({ method: "get", url: `/teams/${teamId}/stats` }, options);

export const listAwards = (tournamentId, options) =>
  request({ method: "get", url: `/tournaments/${tournamentId}/awards` }, options);

export const createAward = (tournamentId, data) =>
  request({ method: "post", url: `/tournaments/${tournamentId}/awards`, data });

export const deleteAward = (awardId) => request({ method: "delete", url: `/awards/${awardId}` });

// Public PDFs open directly in the browser (no auth needed)
export const exportUrl = (tournamentId, kind, { download = false } = {}) =>
  `${env.apiBaseUrl}/tournaments/${tournamentId}/exports/${kind}.pdf${download ? "?download=1" : ""}`;
