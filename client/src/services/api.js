import axios from "axios";

const API_BASE = "/api";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("sms_token");
      localStorage.removeItem("sms_user");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  },
);

export const api = {
  get: (url, params) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  del: (url) => apiClient.delete(url),
};

export default api;
