import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // useful for cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // Example for future JWT
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);