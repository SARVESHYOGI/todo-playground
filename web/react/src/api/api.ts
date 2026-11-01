import axios, { isAxiosError } from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clearToken, getToken } from "./token";
import { authErrorStatuses } from "./backendConfig";
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
    const status = error.response?.status;
    if (typeof status === "number" && authErrorStatuses.includes(status)) {
      clearToken();
    }
    return Promise.reject(error);
  },
);

function detailMessage(detail: ApiError["detail"]): string | null {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg)
      .filter((msg): msg is string => Boolean(msg));
    if (messages.length) return messages.join(", ");
  }
  return null;
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data?.errors?.length) return data.errors.join(", ");
    const detail = detailMessage(data?.detail);
    if (detail) return detail;
    return error.message;
  }
  return error instanceof Error ? error.message : "Unknown error";
}

export function isUnauthorized(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return typeof status === "number" && authErrorStatuses.includes(status);
}

export default api;
