import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.MODE === "production") return "/api";
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return `http://${window.location.hostname}:5000/api`;
};

export const api = axios.create({
  baseURL: getBaseUrl()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stuhub-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
