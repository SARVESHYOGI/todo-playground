import axios, { isAxiosError } from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clearToken, getToken } from "./token";
import type { ApiError } from "../types/api";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 5000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data?.errors?.length) return data.errors.join(", ");
    return error.message;
  }
  return error instanceof Error ? error.message : "Unknown error";
}

export function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}

export default api;
