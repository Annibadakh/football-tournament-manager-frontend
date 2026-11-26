// Mirrors backend PLACE_SEARCH_TYPE: CITY limits suggestions to towns/cities
export const PLACE_SEARCH_TYPE = Object.freeze({
  ANY: "any",
  CITY: "city",
});

export const PLACE_QUERY_MIN = 2;

// Opens the place in Google Maps (works on phones too)
export const buildMapsUrl = (place) =>
  `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}${
    place.googlePlaceId?.startsWith("sample-") ? "" : `&query_place_id=${place.googlePlaceId}`
  }`;
