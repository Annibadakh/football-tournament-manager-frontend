import axios from "axios";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { ERROR_CODES } from "@/constants/common.constants";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

const buildSuccess = (response) => {
  const body = response.data ?? {};
  return {
    ok: true,
    status: response.status,
    data: body.data ?? null,
    meta: body.meta ?? null,
    message: body.message ?? "",
    code: null,
    errors: [],
  };
};

const buildFailure = ({ status = null, message, code, errors = [], cancelled = false }) => ({
  ok: false,
  status,
  data: null,
  meta: null,
  message,
  code,
  errors,
  cancelled,
});

// Every failure (API error, timeout, offline, odd body) ends up in the same shape
const normalizeError = (error) => {
  if (axios.isCancel(error)) return buildFailure({ message: "", code: null, cancelled: true });

  if (!error.response) {
    const isTimeout = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    return buildFailure({
      message: isTimeout
        ? "The request took too long. Please try again."
        : "Unable to reach the server. Check your internet connection.",
      code: isTimeout ? ERROR_CODES.TIMEOUT : ERROR_CODES.NETWORK_ERROR,
    });
  }

  const { status, data: body } = error.response;
  return buildFailure({
    status,
    message: body?.message || FALLBACK_ERROR_MESSAGE,
    code: body?.code || ERROR_CODES.INTERNAL_ERROR,
    errors: body?.errors ?? [],
  });
};

const isReadRequest = (method = "get") => method.toLowerCase() === "get";

/**
 * Central wrapper for every API call. Never throws; components check `res.ok`.
 * Toasts: errors by default, success only for mutations (uses the backend message).
 */
export const request = async (config, options = {}) => {
  const {
    successToast = !isReadRequest(config.method),
    errorToast = true,
    loadingMessage,
  } = options;
  const toastId = loadingMessage ? toast.loading(loadingMessage) : undefined;

  try {
    const result = buildSuccess(await apiClient.request(config));
    if (successToast && result.message) toast.success(result.message, { id: toastId });
    else if (toastId) toast.dismiss(toastId);
    return result;
  } catch (error) {
    const result = normalizeError(error);
    if (errorToast && !result.cancelled) toast.error(result.message, { id: toastId });
    else if (toastId) toast.dismiss(toastId);
    return result;
  }
};
