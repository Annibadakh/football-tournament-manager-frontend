import apiClient, { configureApiAuth } from "@/services/apiClient";

// Fake network: first call with the old token gets 401, retry with the new token succeeds
const installAdapter = () => {
  const seenTokens = [];
  apiClient.defaults.adapter = async (config) => {
    seenTokens.push(config.headers.Authorization);
    const status = config.headers.Authorization === "Bearer new-token" ? 200 : 401;
    const response = {
      status,
      data: { success: status === 200 },
      headers: {},
      config,
      statusText: "",
    };
    if (status === 401) {
      const error = new Error("Unauthorized");
      error.response = response;
      error.config = config;
      throw error;
    }
    return response;
  };
  return seenTokens;
};

describe("apiClient 401 handling", () => {
  it("refreshes once and replays the request with the new token", async () => {
    const seenTokens = installAdapter();
    const refreshSession = vi.fn().mockResolvedValue("new-token");
    configureApiAuth({
      getAccessToken: () => "old-token",
      refreshSession,
      onSessionExpired: vi.fn(),
    });

    const response = await apiClient.get("/me");

    expect(response.status).toBe(200);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(seenTokens).toEqual(["Bearer old-token", "Bearer new-token"]);
  });

  it("ends the session when refresh fails", async () => {
    installAdapter();
    const onSessionExpired = vi.fn();
    configureApiAuth({
      getAccessToken: () => "old-token",
      refreshSession: vi.fn().mockResolvedValue(null),
      onSessionExpired,
    });

    await expect(apiClient.get("/me")).rejects.toThrow("Unauthorized");
    expect(onSessionExpired).toHaveBeenCalled();
  });

  it("never refreshes for auth endpoints", async () => {
    installAdapter();
    const refreshSession = vi.fn();
    configureApiAuth({ getAccessToken: () => null, refreshSession });

    await expect(apiClient.post("/auth/login", {}, { skipAuthRefresh: true })).rejects.toThrow();
    expect(refreshSession).not.toHaveBeenCalled();
  });
});
