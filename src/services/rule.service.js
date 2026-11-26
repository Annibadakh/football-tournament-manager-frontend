import { request } from "@/services/request";

export const listRules = (params) => request({ method: "get", url: "/rules", params });

export const createRule = (data) => request({ method: "post", url: "/rules", data });

export const updateRule = (ruleId, data) =>
  request({ method: "patch", url: `/rules/${ruleId}`, data });
