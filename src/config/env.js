// Only place that reads import.meta.env
const env = Object.freeze({
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  isDev: import.meta.env.DEV,
});

export default env;
