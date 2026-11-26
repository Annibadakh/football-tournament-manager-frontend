import store from "@/store";
import { configureApiAuth } from "@/services/apiClient";
import * as authService from "@/services/auth.service";
import { clearSession, setSession } from "@/store/slices/authSlice";

let refreshInFlight = null;

// One refresh at a time: parallel 401s all wait for the same new token
export const refreshAccessToken = () => {
  if (!refreshInFlight) {
    refreshInFlight = authService
      .refreshSession()
      .then((res) => {
        if (!res.ok) {
          store.dispatch(clearSession());
          return null;
        }
        store.dispatch(setSession(res.data));
        return res.data.accessToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

export const startSession = (sessionData) => store.dispatch(setSession(sessionData));

export const endSession = async () => {
  await authService.logout();
  store.dispatch(clearSession());
};

configureApiAuth({
  getAccessToken: () => store.getState().auth.accessToken,
  refreshSession: refreshAccessToken,
  onSessionExpired: () => store.dispatch(clearSession()),
});
