import { request } from "@/services/request";

export const listTournaments = (params, options) =>
  request({ method: "get", url: "/tournaments", params, ...options });

export const listManagedTournaments = (params, options) =>
  request({ method: "get", url: "/me/tournaments", params, ...options });

export const getTournament = (tournamentId, options) =>
  request({ method: "get", url: `/tournaments/${tournamentId}` }, options);

export const createTournament = (data) => request({ method: "post", url: "/tournaments", data });

export const updateTournament = (tournamentId, data) =>
  request({ method: "patch", url: `/tournaments/${tournamentId}`, data });

export const changeTournamentStatus = (tournamentId, status) =>
  request({ method: "patch", url: `/tournaments/${tournamentId}/status`, data: { status } });

export const listGrounds = (tournamentId) =>
  request({ method: "get", url: `/tournaments/${tournamentId}/grounds` });

export const replaceGrounds = (tournamentId, grounds) =>
  request({ method: "put", url: `/tournaments/${tournamentId}/grounds`, data: { grounds } });

export const listTournamentRules = (tournamentId) =>
  request({ method: "get", url: `/tournaments/${tournamentId}/rules` });

export const replaceTournamentRules = (tournamentId, rules) =>
  request({ method: "put", url: `/tournaments/${tournamentId}/rules`, data: { rules } });

export const listTournamentCategories = () =>
  request({ method: "get", url: "/tournament-categories" });
