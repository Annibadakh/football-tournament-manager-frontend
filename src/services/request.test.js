import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { request } from "@/services/request";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(() => "toast-id"), dismiss: vi.fn() },
}));

// Swaps axios' network layer so request() runs against canned responses
const respondWith = (status, body) => {
  apiClient.defaults.adapter = async (config) => {
    const response = { status, data: body, headers: {}, config, statusText: "" };
    if (status >= 400) {
      const error = new Error(`Request failed with status ${status}`);
      error.response = response;
      error.config = config;
      throw error;
    }
    return response;
  };
};

describe("request()", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns data and meta from a success envelope without toasting GETs", async () => {
    respondWith(200, {
      success: true,
      message: "Teams fetched",
      data: [{ id: 1 }],
      meta: { total: 1 },
    });

    const res = await request({ method: "get", url: "/teams" });

    expect(res).toMatchObject({
      ok: true,
      data: [{ id: 1 }],
      meta: { total: 1 },
      message: "Teams fetched",
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("toasts the backend message on successful mutations", async () => {
    respondWith(201, { success: true, message: "Team created", data: { id: 9 } });

    const res = await request({ method: "post", url: "/teams", data: {} });

    expect(res.ok).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Team created", { id: undefined });
  });

  it("normalizes API errors with field errors and never throws", async () => {
    respondWith(400, {
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: [{ field: "teamName", message: "Team name is required" }],
    });

    const res = await request({ method: "post", url: "/teams" });

    expect(res).toMatchObject({
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      errors: [{ field: "teamName", message: "Team name is required" }],
    });
    expect(toast.error).toHaveBeenCalledWith("Validation failed", { id: undefined });
  });

  it("maps network failures to NETWORK_ERROR", async () => {
    apiClient.defaults.adapter = async () => {
      throw new Error("Network Error");
    };

    const res = await request({ method: "get", url: "/teams" }, { errorToast: false });

    expect(res).toMatchObject({ ok: false, code: "NETWORK_ERROR" });
    expect(toast.error).not.toHaveBeenCalled();
  });
});
