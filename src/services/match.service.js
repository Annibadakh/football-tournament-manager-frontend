import { request } from "@/services/request";

const tournamentUrl = (tournamentId, path) => `/tournaments/${tournamentId}/${path}`;

export const getGroups = (tournamentId, options) =>
  request({ method: "get", url: tournamentUrl(tournamentId, "groups") }, options);

export const drawGroups = (tournamentId, data) =>
  request({ method: "post", url: tournamentUrl(tournamentId, "group-draw"), data });

export const saveGroups = (tournamentId, data) =>
  request({ method: "put", url: tournamentUrl(tournamentId, "groups"), data });

// Generation returns 409 + field "replace" when fixtures exist; the caller confirms and retries
export const generateFixtures = (tournamentId, data, options) =>
  request({ method: "post", url: tournamentUrl(tournamentId, "fixtures"), data }, options);

export const deleteFixtures = (tournamentId) =>
  request({ method: "delete", url: tournamentUrl(tournamentId, "fixtures") });

export const scheduleMatches = (tournamentId, data) =>
  request({ method: "post", url: tournamentUrl(tournamentId, "schedule"), data });

export const listMatches = (tournamentId, params, options) =>
  request({ method: "get", url: tournamentUrl(tournamentId, "matches"), params }, options);

export const addMatch = (tournamentId, data) =>
  request({ method: "post", url: tournamentUrl(tournamentId, "matches"), data });

export const getBracket = (tournamentId, options) =>
  request({ method: "get", url: tournamentUrl(tournamentId, "bracket") }, options);

export const getMatch = (matchId, options) =>
  request({ method: "get", url: `/matches/${matchId}` }, options);

export const updateMatch = (matchId, data) =>
  request({ method: "patch", url: `/matches/${matchId}`, data });

export const deleteMatch = (matchId) => request({ method: "delete", url: `/matches/${matchId}` });
