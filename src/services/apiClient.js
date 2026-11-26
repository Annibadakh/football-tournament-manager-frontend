import axios from "axios";
import env from "@/config/env";
import { API_TIMEOUT_MS, CLIENT_PLATFORM } from "@/constants/common.constants";

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: API_TIMEOUT_MS,
  // Sends the httpOnly refresh-token cookie to /auth endpoints
  withCredentials: true,
  headers: { "X-Client-Platform": CLIENT_PLATFORM },
});

// The session layer plugs these in, so this file never imports the store
const authHandlers = {
  getAccessToken: () => null,
  refreshSession: async () => null,
  onSessionExpired: () => {},
};

export const configureApiAuth = (handlers) => Object.assign(authHandlers, handlers);

apiClient.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken();
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Access tokens live 15 minutes: on a 401, refresh once and replay the original request
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isUnauthorized = error.response?.status === 401;
    if (!isUnauthorized || !original || original.skipAuthRefresh || original.hasRetried) {
      return Promise.reject(error);
    }

    original.hasRetried = true;
    const newToken = await authHandlers.refreshSession();
    if (!newToken) {
      authHandlers.onSessionExpired();
      return Promise.reject(error);
    }
    original.headers.Authorization = `Bearer ${newToken}`;
    return apiClient.request(original);
  },
);

export default apiClient;
