import { request } from "@/services/request";

export const listStreams = (tournamentId, options) =>
  request({ method: "get", url: `/tournaments/${tournamentId}/streams` }, options);

// Responses carry { stream, warnings } so callers can show YouTube check warnings
export const createStream = (tournamentId, data) =>
  request({ method: "post", url: `/tournaments/${tournamentId}/streams`, data });

export const updateStream = (streamId, data, options) =>
  request({ method: "patch", url: `/streams/${streamId}`, data }, options);

export const deleteStream = (streamId) =>
  request({ method: "delete", url: `/streams/${streamId}` });

export const listMyStreamingTournaments = (options) =>
  request({ method: "get", url: "/me/streaming" }, options);
