import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const SKIP_REFRESH_URLS = ["/auth/login", "/auth/refresh", "/auth/logout"];

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest.url || "";

    const shouldSkip = SKIP_REFRESH_URLS.some((url) => requestUrl.includes(url));

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkip) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(async () => {
            originalRequest._retry = true;
            try {
              return await api(originalRequest);
            } catch (retryErr) {
              if (axios.isAxiosError(retryErr) && retryErr.response?.status === 401) {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("auth-expired"));
                }
              }
              return Promise.reject(retryErr);
            }
          })
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshClient.post("/auth/refresh");
      } catch (err) {
        processQueue(err);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-expired"));
        }
        isRefreshing = false;
        return Promise.reject(err);
      }

      processQueue(null);
      isRefreshing = false;
      try {
        return await api(originalRequest);
      } catch (retryErr) {
        if (axios.isAxiosError(retryErr) && retryErr.response?.status === 401) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth-expired"));
          }
        }
        return Promise.reject(retryErr);
      }
    }

    return Promise.reject(error);
  }
);
