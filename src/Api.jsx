import axios from "axios";

const getAuthToken = () => sessionStorage.getItem("user");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(  
  (config) => {
    const userString = getAuthToken();
    const user = JSON.parse(userString);

    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
