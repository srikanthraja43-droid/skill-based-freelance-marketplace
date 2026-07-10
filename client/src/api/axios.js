import axios from "axios";
import { store } from "../app/store";
import { logout, setTokens } from "../features/auth/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED" && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => { originalRequest.headers.Authorization = `Bearer ${token}`; return api(originalRequest); });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = store.getState().auth.refreshToken;
        const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data;
        store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(logout());
        return Promise.reject(err);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default api;
