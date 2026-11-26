import { request } from "@/services/request";

export const listPositions = () => request({ method: "get", url: "/positions" });
