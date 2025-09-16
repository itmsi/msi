import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
// Base configuration for axios
const api = axios.create({
    baseURL: '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
    (config) => {
        // Try to get token from new auth system first, then fallback to legacy
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle common errors here
        if (error.response?.status === 401) {
            // Only clear auth data if this is not during app initialization
            // Check if this is a valid 401 from actual API call, not initialization
            const requestUrl = error.config?.url || '';
            
            // Don't clear auth data on initial page load or if there's no auth data to begin with
            const hasAuthData = localStorage.getItem('auth_token');
            
            if (hasAuthData && !requestUrl.includes('/auth/')) {
                // console.log('401 error detected, clearing auth data and redirecting...');
                // Unauthorized - clear auth data and redirect to login
                // localStorage.removeItem('auth_user');
                // localStorage.removeItem('auth_permissions');
                // localStorage.removeItem('auth_session');
                // localStorage.removeItem('auth_oauth');
                // localStorage.removeItem('auth_token');
                // localStorage.removeItem('isLoggedIn');
                // // Also clear legacy items for backward compatibility
                // localStorage.removeItem('token');
                // localStorage.removeItem('keepLogin');
                // localStorage.removeItem('profile');
                // window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// Generic API response type
export interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    message?: string;
}

// Generic error type
export interface ApiError {
    message: string;
    status?: number;
}

// API Error Response interface
interface ApiErrorResponse {
    message?: string;
    error?: string;
    [key: string]: unknown;
}

// GET request helper
export const apiGet = async <T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.get(url, { params });
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// POST request helper
export const apiPost = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.post(url, data, config);
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// PUT request helper
export const apiPut = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.put(url, data);
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// PATCH request helper
export const apiPatch = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.patch(url, data);
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// DELETE request helper
export const apiDelete = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.delete(url);
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// POST request helper for multipart/form-data
export const apiPostMultipart = async <T = unknown>(url: string, data: FormData): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.post(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// PUT request helper for multipart/form-data
export const apiPutMultipart = async <T = unknown>(url: string, data: FormData): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.put(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// Error handling helper
const handleApiError = (error: AxiosError<ApiErrorResponse>): ApiError => {
    if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        return {
            message: errorData?.message || errorData?.error || error.message,
            status: error.response.status,
        };
    } else if (error.request) {
        // Request was made but no response received
        return {
            message: 'Network error - no response from server',
        };
    } else {
        // Something else happened
        return {
            message: error.message || 'An unexpected error occurred',
        };
    }
};

export default api;
