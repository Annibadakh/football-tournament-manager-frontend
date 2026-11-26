import { request } from "@/services/request";

export const searchPlaces = (params, options) =>
  request(
    { method: "get", url: "/places/autocomplete", params, ...options },
    { errorToast: false },
  );

export const resolvePlace = (data) =>
  request({ method: "post", url: "/places", data }, { successToast: false });
