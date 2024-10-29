import { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { store } from "../store/store.ts"; // Adjust the import path to your Redux store
import { clearAuthData, setAuthData } from "../store/authSlice.ts"; // Your Redux actions to manage tokens

// Configure Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = () => store.getState().auth.token;

// Create a base query using Axios for RTK Query with token handling
export const axiosBaseQuery =
  (): BaseQueryFn<{
    url: string;
    method: AxiosRequestConfig["method"];
    data?: AxiosRequestConfig["data"];
    params?: AxiosRequestConfig["params"];
    requireAuth?: boolean; // Optional flag to include token
  }> =>
  async ({ url, method, data, params, requireAuth = true }) => {
    try {
      const accessToken = requireAuth ? getAccessToken() : null;
      const response = await axiosInstance({
        url,
        method,
        data,
        params,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;

      // Check if error status is 401 (Unauthorized) and re-authentication is needed
      if (axiosError.response?.status === 401 && requireAuth) {
        try {
          // Attempt to refresh the token if it's expired
          const refreshToken = store.getState().auth.refreshtoken;
          const refreshResponse = await axiosInstance.post("/auth/refresh", {
            refreshToken,
          });

          const tokenData = refreshResponse.data;
          store.dispatch(setAuthData(tokenData)); 

          // Retry the original request with the new token
          const retryResponse = await axiosInstance({
            url,
            method,
            data,
            params,
            headers: { Authorization: `Bearer ${tokenData.token}` },
          });

          return { data: retryResponse.data };
        } catch (refreshError) {
          // Clear tokens and handle logout if refresh fails
          store.dispatch(clearAuthData());
          return {
            error: {
              status: (refreshError as AxiosError).response?.status,
              data: "Session expired. Please log in again.",
            },
          };
        }
      }

      // For other errors, return as usual
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      };
    }
  };
