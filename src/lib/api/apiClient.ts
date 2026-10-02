import axios from "axios";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "./store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") {
      return config;
    }

    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage) as {
          state?: { token?: string };
        };
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error?.response?.status;
      const url: string = error?.config?.url ?? "";
      const isAuthRequest =
        url.includes("/auth/login") || url.includes("/auth/register");

      if (status === 401 && !isAuthRequest) {
        useAuthStore.getState().clearAuth();
        queryClient.clear();
      }
    }

    return Promise.reject(error);
  },
);
