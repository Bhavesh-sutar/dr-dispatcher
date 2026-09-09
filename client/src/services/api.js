import axios from "axios";
import notificationService from "./notificationService";
import authServiceBridge from "./authServiceBridge";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      notificationService.showNotification(
        "error",
        "Your session has expired. Please log in again.",
      );
      authServiceBridge.triggerLogout();
    } else if (status === 403) {
      notificationService.showNotification(
        "error",
        "You don't have permission to perform this action.",
      );
    } else if (status === 500) {
      notificationService.showNotification(
        "error",
        "Something went wrong on the server. Please try again later.",
      );
    } else if (!error.response) {
      notificationService.showNotification(
        "error",
        "Unable to connect to the server. Please try again.",
      );
    }

    return Promise.reject(error);
  },
);

export default api;
