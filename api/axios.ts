import axios from "axios";
import { ApiError } from "./types";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 500;
    const message =
      error.response?.data?.status?.message ??
      error.message ??
      "An unexpected error occurred";
    return Promise.reject(new ApiError(status, message));
  }
);

export default apiClient;
