import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "",
  timeout:5000
})

// api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//   config.headers.set("Authorization", `Bearer ${getToken()}`);
//   return config;
// })

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error:AxiosError)=>Promise.reject(error)
)
