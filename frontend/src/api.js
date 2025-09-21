
import axios from "axios";
import { getErrorMessage, logError } from "./utils/errorHandling";
import { extractResponseData, extractResponseError, normalizeApiResponse } from "./utils/apiResponseHandler";

const api = axios.create({
  baseURL: "/api/",
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const PUBLIC_ENDPOINTS = ['register/', 'token/', 'token/refresh/'];
// Request interceptor to add authentication headers for protected endpoints
api.interceptors.request.use(
  (config) => {
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
      config.url && config.url.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = localStorage.getItem("access");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Response interceptor to normalize responses and handle authentication errors
api.interceptors.response.use(
  (response) => {
    if (response.data && !response.data.success && !response.data.timestamp) {
      response.data = normalizeApiResponse(response.data);
    }
    return response;
  },
  (error) => {
    logError(error, `API call to ${error.config?.url}`);

    // Handle 401 authentication errors by clearing tokens and redirecting to login
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
        window.location.href = '/login';
      }
    }

    const errorInfo = extractResponseError(error);
    error.standardizedError = errorInfo;
    error.userMessage = errorInfo.message;

    return Promise.reject(error);
  }
);

export default api;
