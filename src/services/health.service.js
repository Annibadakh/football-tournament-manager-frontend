import { request } from "@/services/request";

export const getHealthStatus = (options) => request({ method: "get", url: "/health" }, options);
