import axios from "axios";
import env from "@/config/env";
import { API_TIMEOUT_MS, CLIENT_PLATFORM } from "@/constants/common.constants";

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: API_TIMEOUT_MS,
  // Sends the refresh-token cookie once auth lands in Phase 1
  withCredentials: true,
  headers: { "X-Client-Platform": CLIENT_PLATFORM },
});

// The auth layer plugs these in, so this file never imports the store
const authHandlers = {
  getAccessToken: () => null,
  onUnauthorized: () => {},
};

export const configureApiAuth = ({ getAccessToken, onUnauthorized }) => {
  if (getAccessToken) authHandlers.getAccessToken = getAccessToken;
  if (onUnauthorized) authHandlers.onUnauthorized = onUnauthorized;
};

apiClient.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) authHandlers.onUnauthorized(error);
    return Promise.reject(error);
  },
);

export default apiClient;
