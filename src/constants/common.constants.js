export const APP_NAME = "Maidaan";
export const APP_TAGLINE = "Your tournament. Live.";

export const THEME_MODE = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
});

export const STORAGE_KEYS = Object.freeze({
  THEME: "maidaan.theme",
});

// Sent on every request so the API can tell web traffic from the future mobile app
export const CLIENT_PLATFORM = "web";

export const API_TIMEOUT_MS = 15000;
export const SEARCH_DEBOUNCE_MS = 400;

export const PAGE_SIZE_OPTIONS = Object.freeze([10, 20, 50]);
export const DEFAULT_PAGE_SIZE = 10;

// Mirrors the backend ERROR_CODES, plus client-only network failures
export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
});

export const DATE_FORMATS = Object.freeze({
  DATE: "dd MMM yyyy",
  TIME: "hh:mm a",
  DATE_TIME: "dd MMM yyyy, hh:mm a",
});

export const SOCIAL_LINKS = Object.freeze({
  INSTAGRAM: "https://instagram.com/maidaan.baller",
  YOUTUBE: "https://youtube.com/@maidaan.baller",
});
