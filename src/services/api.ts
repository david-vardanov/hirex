import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
} from "axios";
import {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  NetworkError,
} from "@/types";

// API configuration
const API_URL = process.env.VUE_APP_API_URL || "https://api.example.com";
const API_TIMEOUT = 15000;
const API_RETRY_ATTEMPTS = 2;
const API_RETRY_DELAY = 1000;

// Type for onProgress callback
type ProgressCallback = (progressEvent: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Track request start time for performance monitoring
    (config as any).metadata = { startTime: new Date().getTime() };

    // Add auth token if available
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("[APIClient] Error accessing localStorage:", err);
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[APIClient] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: any): Promise<never> => {
    console.error("[APIClient] Request preparation error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): ApiSuccessResponse => {
    // Calculate request duration for performance monitoring
    const requestDuration = calculateRequestDuration(response);
    logPerformanceMetrics(response.config, requestDuration);

    // Transform successful responses
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
    };
  },
  (error: AxiosError): Promise<ApiErrorResponse> => {
    // Calculate request duration even for errors
    const requestDuration = calculateRequestDuration(error);
    logPerformanceMetrics(error.config, requestDuration);

    // Transform error responses
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        message: "Network error",
        type: "NetworkError",
        status: 500,
      },
      originalError: error,
    };

    if (error.response) {
      // Server responded with an error
      errorResponse.error = {
        message: error.response.data.message || "Server error",
        type: "ServerError",
        status: error.response.status,
        data: error.response.data,
      };

      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - clear auth and redirect to login
        try {
          localStorage.removeItem("auth_token");

          // Don't redirect if this is a login/validate request
          const isAuthRequest = error.config.url?.includes("/auth/");
          if (!isAuthRequest) {
            window.location.href = "/login";
          }
        } catch (localStorageError) {
          console.error(
            "[APIClient] Error clearing localStorage:",
            localStorageError
          );
        }
      }
    } else if (error.request) {
      // No response received
      errorResponse.error = {
        message: "No response from server",
        type: "TimeoutError",
        status: 0,
      };
    }

    console.error(
      `[APIClient] ${error.config?.method?.toUpperCase() || "REQUEST"} ${
        error.config?.url
      } failed:`,
      errorResponse.error
    );
    return Promise.resolve(errorResponse);
  }
);

// Helper functions for performance monitoring
function calculateRequestDuration(
  response: AxiosResponse | AxiosError
): number {
  try {
    const config =
      (response as AxiosResponse)?.config || (response as AxiosError)?.config;
    const startTime = (config as any)?.metadata?.startTime;
    if (startTime) {
      return new Date().getTime() - startTime;
    }
  } catch (error) {
    console.error("[APIClient] Error calculating request duration:", error);
  }
  return 0;
}

function logPerformanceMetrics(config: any, duration: number): void {
  if (duration > 1000) {
    console.warn(
      `[APIClient] Slow request: ${config?.method?.toUpperCase()} ${
        config?.url
      } took ${duration}ms`
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[APIClient] ${config?.method?.toUpperCase()} ${
        config?.url
      } completed in ${duration}ms`
    );
  }
}

// Retry mechanism for transient errors
async function executeWithRetry<T>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = API_RETRY_ATTEMPTS
): Promise<ApiResponse<T>> {
  let lastError: ApiErrorResponse | null = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const response = await requestFn();

      // Don't retry 4xx errors (client errors)
      if (
        !response.success &&
        response.error.status &&
        response.error.status >= 400 &&
        response.error.status < 500
      ) {
        return response;
      }

      // Return successful response or 5xx error after max retries
      if (response.success || retryCount === maxRetries) {
        return response;
      }

      // Store error for potential retry
      lastError = response as ApiErrorResponse;

      // Exponential backoff
      const delay = API_RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(
        `[APIClient] Retrying request (${retryCount + 1}/${
          maxRetries + 1
        }) after ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));

      retryCount++;
    } catch (error) {
      console.error(
        `[APIClient] Unexpected error during retry (${retryCount}/${maxRetries}):`,
        error
      );
      if (retryCount === maxRetries) {
        throw error;
      }
      retryCount++;
    }
  }

  return (
    lastError || {
      success: false,
      error: {
        message: "Maximum retries exceeded",
        type: "RetryLimitError",
      },
    }
  );
}

// API service with consistent method signatures
export const apiService = {
  /**
   * Perform GET request
   * @param url - Endpoint URL
   * @param params - Query parameters
   * @param options - Additional axios options
   * @returns Promise with typed response
   */
  get: async <T = any>(
    url: string,
    params: Record<string, any> = {},
    options: Partial<AxiosRequestConfig> = {}
  ): Promise<ApiResponse<T>> => {
    try {
      return await executeWithRetry<T>(() =>
        apiClient.get(url, { params, ...options })
      );
    } catch (error) {
      console.error(`[APIClient] GET ${url} failed:`, error);
      throw new NetworkError(`Failed to fetch data from ${url}`);
    }
  },

  /**
   * Perform POST request
   * @param url - Endpoint URL
   * @param data - Request payload
   * @param options - Additional axios options
   * @returns Promise with typed response
   */
  post: async <T = any>(
    url: string,
    data: Record<string, any> = {},
    options: Partial<AxiosRequestConfig> = {}
  ): Promise<ApiResponse<T>> => {
    try {
      return await executeWithRetry<T>(() =>
        apiClient.post(url, data, options)
      );
    } catch (error) {
      console.error(`[APIClient] POST ${url} failed:`, error);
      throw new NetworkError(`Failed to submit data to ${url}`);
    }
  },

  /**
   * Perform PUT request
   * @param url - Endpoint URL
   * @param data - Request payload
   * @param options - Additional axios options
   * @returns Promise with typed response
   */
  put: async <T = any>(
    url: string,
    data: Record<string, any> = {},
    options: Partial<AxiosRequestConfig> = {}
  ): Promise<ApiResponse<T>> => {
    try {
      return await executeWithRetry<T>(() => apiClient.put(url, data, options));
    } catch (error) {
      console.error(`[APIClient] PUT ${url} failed:`, error);
      throw new NetworkError(`Failed to update data at ${url}`);
    }
  },

  /**
   * Perform DELETE request
   * @param url - Endpoint URL
   * @param options - Additional axios options
   * @returns Promise with typed response
   */
  delete: async <T = any>(
    url: string,
    options: Partial<AxiosRequestConfig> = {}
  ): Promise<ApiResponse<T>> => {
    try {
      return await executeWithRetry<T>(() => apiClient.delete(url, options));
    } catch (error) {
      console.error(`[APIClient] DELETE ${url} failed:`, error);
      throw new NetworkError(`Failed to delete resource at ${url}`);
    }
  },

  /**
   * Upload file with progress tracking
   * @param url - Upload endpoint URL
   * @param formData - FormData with files
   * @param onProgress - Optional progress callback
   * @returns Promise with typed response
   */
  upload: async <T = any>(
    url: string,
    formData: FormData,
    onProgress: ProgressCallback | null = null
  ): Promise<ApiResponse<T>> => {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent: any) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1) // Avoid division by zero
          );

          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total || 0,
            percentage,
          });
        };
      }

      // Upload requests can take longer, so increase timeout
      config.timeout = API_TIMEOUT * 3;

      // Note: we don't use retry for uploads as they can cause duplicate uploads
      return await apiClient.post(url, formData, config);
    } catch (error) {
      console.error(`[APIClient] UPLOAD to ${url} failed:`, error);
      throw new NetworkError(`Failed to upload file to ${url}`);
    }
  },

  /**
   * Cancel pending requests matching a specific identifier
   * @param requestId - Identifier to match pending requests
   */
  cancelRequests: (requestId: string): void => {
    // Implementation would depend on maintaining a map of request cancel tokens
    console.warn("[APIClient] Request cancellation not yet implemented");
  },

  /**
   * Clear any cached responses
   */
  clearCache: (): void => {
    // Implementation would depend on your caching strategy
    console.warn("[APIClient] Cache clearing not yet implemented");
  },
};
